import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const BOX_W = 980;

// Graph area constants — unchanged so all node/edge geometry is identical
const GRAPH_W = 620;
const GRAPH_H = 250;
const GRAPH_X = 20;
const GRAPH_Y = 60;
const GRAPH_AREA_H = GRAPH_Y + GRAPH_H + 80;

const NODE_R = 28;
const SCISSOR_SIZE = 34;
const CUT_DISTANCE = 12;
const DOUBLE_TAP_MS = 320;

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function getNodePositions(count) {
  const safeCount = Math.max(count, 1);
  const cx = GRAPH_X + GRAPH_W / 2;
  const cy = GRAPH_Y + GRAPH_H / 2;
  const maxRadius = Math.min(GRAPH_W, GRAPH_H) / 2 - 52;

  let radius = maxRadius;
  if (safeCount <= 2) radius = 120;
  else if (safeCount <= 4) radius = 120;
  else if (safeCount <= 6) radius = 120;
  else if (safeCount <= 8) radius = 120;
  else radius = 120;

  return Array.from({ length: safeCount }).map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / safeCount;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy))
  );

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY);
}

function getConnectionStateColor(ratio) {
  if (ratio >= 0.7) {
    return {
      border: "#22c55e",
      fill: "rgba(34,197,94,0.10)",
      glow: "0 0 18px rgba(34,197,94,0.45)",
      text: "#86efac",
    };
  }

  if (ratio >= 0.5) {
    return {
      border: "#f59e0b",
      fill: "rgba(245,158,11,0.10)",
      glow: "0 0 18px rgba(245,158,11,0.40)",
      text: "#fcd34d",
    };
  }

  return {
    border: "#ef4444",
    fill: "rgba(239,68,68,0.10)",
    glow: "0 0 18px rgba(239,68,68,0.40)",
    text: "#fca5a5",
  };
}

function generateEmbeddingVector(word) {
  const cleanWord = (word || "").toLowerCase();

  if (!cleanWord) return [0, 0, 0, 0];

  const chars = cleanWord.split("");
  const codes = chars.map((char) => char.charCodeAt(0));

  const sum = codes.reduce((acc, code) => acc + code, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;

  const vowelCount = chars.filter((char) =>
    ["a", "e", "i", "o", "u"].includes(char)
  ).length;

  return [
    Number(((sum % 100) / 100).toFixed(2)),
    Number((((first * length) % 100) / 100).toFixed(2)),
    Number((((last + vowelCount * 7) % 100) / 100).toFixed(2)),
    Number(((((sum + first + last + length) * 3) % 100) / 100).toFixed(2)),
  ];
}

function generatePositionVector(position) {
  const pos = position + 1;

  return [
    Number(((pos * 0.1) % 1).toFixed(2)),
    Number(((pos * 0.2) % 1).toFixed(2)),
    Number(((pos * 0.3) % 1).toFixed(2)),
    Number(((pos * 0.4) % 1).toFixed(2)),
  ];
}

function addVectors(a, b) {
  return a.map((value, index) => Number((value + b[index]).toFixed(2)));
}

const WQ = [0.9, 0.3, 0.6, 0.2];
const WK = [0.2, 0.8, 0.4, 0.7];
const WV = [0.7, 0.4, 0.9, 0.3];

function projectVector(input, weights, shift) {
  return input.map((value, index) =>
    Number(((value * weights[index] + shift[index]) % 1).toFixed(2))
  );
}

const Q_SHIFT = [0.03, 0.05, 0.02, 0.04];
const K_SHIFT = [0.04, 0.02, 0.05, 0.03];
const V_SHIFT = [0.02, 0.04, 0.03, 0.05];

function formatVector(vector) {
  return vector.map((v) => v.toFixed(2));
}

function dotProduct(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function normalizeScore(score) {
  return Math.min(0.99, Math.max(0, score / 2.5));
}

function AttentionStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const safeTokens = tokens.length ? tokens.slice(0, 10) : ["token"];
  const positions = useMemo(
    () => getNodePositions(safeTokens.length),
    [safeTokens.length]
  );

  const tokenVectors = useMemo(() => {
    return safeTokens.map((word, index) => {
      const embedding = generateEmbeddingVector(word);
      const positional = generatePositionVector(index);
      const input = addVectors(embedding, positional);

      const query = projectVector(input, WQ, Q_SHIFT);
      const key = projectVector(input, WK, K_SHIFT);
      const value = projectVector(input, WV, V_SHIFT);

      return { word, embedding, positional, input, query, key, value };
    });
  }, [safeTokens]);

  const baseEdges = useMemo(() => {
    const edges = [];
    for (let i = 0; i < safeTokens.length; i += 1) {
      for (let j = i + 1; j < safeTokens.length; j += 1) {
        edges.push({ a: i, b: j, key: edgeKey(i, j) });
      }
    }
    return edges;
  }, [safeTokens.length]);

  const [edgeState, setEdgeState] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedNode, setFocusedNode] = useState(0);
  const [scissorPos, setScissorPos] = useState({
    x: GRAPH_X + GRAPH_W - 50,
    y: 16,
  });
  const [dragging, setDragging] = useState(false);
  const [lastTap, setLastTap] = useState({ node: null, time: 0 });

  const wrapRef = useRef(null);

  useEffect(() => {
    const initial = {};
    baseEdges.forEach((e) => {
      initial[e.key] = true;
    });
    setEdgeState(initial);
    setSelectedNode(null);
  }, [baseEdges]);

  useEffect(() => {
    if (focusedNode > safeTokens.length - 1) {
      setFocusedNode(0);
    }
  }, [safeTokens.length, focusedNode]);

  const connectionRatioByNode = useMemo(() => {
    const totalPossible = Math.max(1, safeTokens.length - 1);

    return safeTokens.map((_, nodeIndex) => {
      let activeCount = 0;

      baseEdges.forEach((e) => {
        if ((e.a === nodeIndex || e.b === nodeIndex) && edgeState[e.key]) {
          activeCount += 1;
        }
      });

      return activeCount / totalPossible;
    });
  }, [safeTokens, baseEdges, edgeState]);

  const lineGeometries = useMemo(() => {
    return baseEdges.map((e) => {
      const p1 = positions[e.a];
      const p2 = positions[e.b];
      return {
        ...e,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        active: !!edgeState[e.key],
      };
    });
  }, [baseEdges, positions, edgeState]);

  const cutIntersectingLines = (tipX, tipY) => {
    setEdgeState((prev) => {
      let changed = false;
      const next = { ...prev };

      lineGeometries.forEach((line) => {
        if (!prev[line.key]) return;

        const d = pointToSegmentDistance(
          tipX,
          tipY,
          line.x1,
          line.y1,
          line.x2,
          line.y2
        );

        if (d <= CUT_DISTANCE) {
          next[line.key] = false;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  };

  const updateScissorFromPointer = (clientX, clientY) => {
    if (!wrapRef.current) return;

    const rect = wrapRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const maxX = GRAPH_X + GRAPH_W - SCISSOR_SIZE - 10;
    const maxY = GRAPH_AREA_H - SCISSOR_SIZE - 12;

    const clampedX = Math.max(12, Math.min(maxX, localX - SCISSOR_SIZE / 2));
    const clampedY = Math.max(12, Math.min(maxY, localY - SCISSOR_SIZE / 2));

    setScissorPos({ x: clampedX, y: clampedY });

    const tipX = clampedX + SCISSOR_SIZE * 0.82;
    const tipY = clampedY + SCISSOR_SIZE * 0.52;
    cutIntersectingLines(tipX, tipY);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      updateScissorFromPointer(e.clientX, e.clientY);
    };

    const onUp = () => {
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, lineGeometries]);

  const handleNodeTap = (nodeIndex) => {
    const now = Date.now();
    const isDoubleTap =
      lastTap.node === nodeIndex && now - lastTap.time <= DOUBLE_TAP_MS;

    setFocusedNode(nodeIndex);
    setLastTap({ node: nodeIndex, time: now });

    if (!isDoubleTap) return;

    if (selectedNode === null) {
      setSelectedNode(nodeIndex);
      return;
    }

    if (selectedNode === nodeIndex) {
      setSelectedNode(null);
      return;
    }

    const key = edgeKey(selectedNode, nodeIndex);

    setEdgeState((prev) => ({
      ...prev,
      [key]: true,
    }));

    setSelectedNode(null);
  };

  const focusedData = tokenVectors[focusedNode] || tokenVectors[0];
const attentionMatrix = tokenVectors.map((sourceToken, rowIndex) =>
  tokenVectors.map((targetToken, colIndex) => {
    const rawScore = dotProduct(sourceToken.query, targetToken.key);
    const normalized = normalizeScore(rawScore);
    const key = edgeKey(rowIndex, colIndex);

    if (rowIndex === colIndex) {
      return {
        raw: rawScore,
        score: Number(normalized.toFixed(2)),
        active: true,
      };
    }

    return {
      raw: rawScore,
      score: Number(normalized.toFixed(2)),
      active: !!edgeState[key],
    };
  })
);
const computeAverageVector = (indexes) => {
  if (indexes.length === 0) return [0, 0, 0, 0];

  const dim = tokenVectors[0].query.length;
  const sum = new Array(dim).fill(0);

  indexes.forEach((i) => {
    tokenVectors[i].query.forEach((v, d) => {
      sum[d] += v;
    });
  });

  return sum.map((v) => Number((v / indexes.length).toFixed(2)));
};
  
  const activeEdgeCount = baseEdges.filter((e) => edgeState[e.key]).length;
  const totalEdgeCount = baseEdges.length;
  const connectionPercent =
    totalEdgeCount === 0
      ? 100
      : Math.round((activeEdgeCount / totalEdgeCount) * 100);
  const sentencePreview = safeTokens.join(" ");    

  const allConnected = activeEdgeCount === totalEdgeCount;
  const partiallyDisconnected =
    activeEdgeCount > 0 && activeEdgeCount < totalEdgeCount;
  const heavilyDisconnected = activeEdgeCount === 0;

  const focusedConnections = baseEdges.filter(
    (e) =>
      (e.a === focusedNode || e.b === focusedNode) &&
      edgeState[e.key]
  ).length;
  const connectedTokenIndexes = safeTokens
    .map((_, index) => {
      if (index === focusedNode) return index;

      const key = edgeKey(focusedNode, index);
      return edgeState[key] ? index : null;
    })
    .filter((value) => value !== null);

  const disconnectedTokenIndexes = safeTokens
    .map((_, index) => {
      if (index === focusedNode) return null;

      const key = edgeKey(focusedNode, index);
      return edgeState[key] ? null : index;
    })
    .filter((value) => value !== null);

const focusedUnderstandingLabel =
  focusedConnections >= Math.max(1, safeTokens.length - 2)
    ? "Strong output context"
    : focusedConnections >= 1
    ? "Partial output context"
    : "Weak output context";
      const focusedWord = safeTokens[focusedNode];

  const connectedWords = connectedTokenIndexes
    .filter((index) => index !== focusedNode)
    .map((index) => safeTokens[index]);

  const disconnectedWords = disconnectedTokenIndexes.map(
    (index) => safeTokens[index]
  );

  const mistakeMessages = [];

  if (disconnectedWords.length === 0) {
    mistakeMessages.push(
      "All important context links are available, so the focused word can build a richer encoder representation."
    );
  }

  if (disconnectedWords.length > 0 && connectedWords.length > 0) {
    mistakeMessages.push(
      "Some useful context is missing, so the focused word is now built from only part of the sentence."
    );
  }

  if (connectedWords.length === 0) {
    mistakeMessages.push(
      "The focused word is isolated from the rest of the sentence, so its output becomes much less contextual."
    );
  }

  if (disconnectedWords.length >= 2) {
    mistakeMessages.push(
      "Because multiple links were removed, the model may miss important relationships between words."
    );
  }
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.97,
      }}
      transition={{ duration: 0.3 }}
      className={`border rounded-2xl overflow-hidden ${
        isDark ? "border-cyan-500" : "border-blue-300 bg-white"
      }`}
      style={{ width: BOX_W }}
    >
      <div className="flex flex-col w-full bg-transparent select-none">
        <div className="pt-5 pb-3 text-center">
          <h2
            className={`font-semibold ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
            style={{ fontSize: "1.6rem" }}
          >
            Self-Attention
          </h2>
          <p
            className={`text-sm mt-1 leading-5 ${
              isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            Each word compares itself with other words to decide what to focus on.
          </p>
          <div
  className={`mx-4 mb-4 rounded-xl border p-3 ${
    isDark
      ? "border-cyan-400/30 bg-cyan-400/5"
      : "border-blue-300 bg-blue-50"
  }`}
>
  <div
    className={`text-sm font-semibold mb-1 ${
      isDark ? "text-cyan-300" : "text-blue-800"
    }`}
  >
    Why we use this step
  </div>

  <p
    className={`text-[11px] leading-5 ${
      isDark ? "text-slate-300" : "text-slate-700"
    }`}
  >
    We use self-attention so each word can look at other words in the sentence and understand context. This helps the model know which words are important for interpreting meaning.
  </p>
</div>
        </div>

        <div
          className={`mx-4 mb-3 rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/95"
              : "border-slate-300 bg-slate-50"
          }`}
          style={{ touchAction: "auto" }}
        >
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <div
                className={`text-sm font-semibold ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Attention details
              </div>
              <div
                className={`text-[11px] ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                Focused word:{" "}
                <span className={isDark ? "text-white" : "text-slate-900"}>
                  {focusedData.word}
                </span>
              </div>
            </div>
            <div
              className={`text-[10px] text-right leading-4 ${
                isDark ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Click any word
              <br />
              to inspect it
            </div>
          </div>

          <div className="space-y-3 text-[11px]">
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-cyan-400/30 bg-cyan-400/5"
                  : "border-blue-300 bg-blue-50"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Input from Positional Encoding
              </div>
              <div
                className={isDark ? "text-slate-300 leading-5" : "text-slate-700 leading-5"}
              >
                Input vector = Embedding + Position
              </div>

              <div className="mt-2 flex items-center gap-2 whitespace-nowrap overflow-x-auto">
                <div className="flex gap-1">
                  {formatVector(focusedData.embedding).map((v, i) => (
                    <span
                      key={`emb-${i}`}
                      className={`px-2 py-1 rounded border ${
                        isDark
                          ? "border-cyan-400 text-cyan-300"
                          : "border-blue-300 text-blue-800 bg-blue-100"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>

                <span className={isDark ? "text-cyan-400" : "text-blue-600"}>+</span>

                <div className="flex gap-1">
                  {formatVector(focusedData.positional).map((v, i) => (
                    <span
                      key={`pos-${i}`}
                      className={`px-2 py-1 rounded border ${
                        isDark
                          ? "border-purple-400 text-purple-300"
                          : "border-violet-300 text-violet-700 bg-violet-100"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>

                <span className={isDark ? "text-cyan-400" : "text-blue-600"}>→</span>

                <div className="flex gap-1">
                  {formatVector(focusedData.input).map((v, i) => (
                    <span
                      key={`inp-${i}`}
                      className={`px-2 py-1 rounded border ${
                        isDark
                          ? "border-green-400 text-green-300"
                          : "border-green-400 text-green-700 bg-green-100"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div
                className={`font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-900"
                }`}
              >
                Q, K, V from the input vector
              </div>

              <div
                className={`text-[11px] leading-5 mb-3 ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                The same input vector is transformed into three versions:
                <br />
                <span className={isDark ? "text-amber-300" : "text-amber-700"}>
                  Q (Query)
                </span>{" "}
                = what this word is looking for
                <br />
                <span className={isDark ? "text-pink-300" : "text-pink-700"}>
                  K (Key)
                </span>{" "}
                = what this word offers to other words
                <br />
                <span className={isDark ? "text-lime-300" : "text-lime-700"}>
                  V (Value)
                </span>{" "}
                = the information passed forward
              </div>

              <div
                className={`rounded-md border p-2 mb-3 ${
                  isDark
                    ? "border-slate-800 bg-slate-900/70"
                    : "border-slate-300 bg-slate-50"
                }`}
              >
                <div
                  className={`text-[10px] mb-1 ${
                    isDark ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  Focused input vector
                </div>
                <div className="flex flex-wrap gap-1">
                  {formatVector(focusedData.input).map((v, i) => (
                    <span
                      key={`input-show-${i}`}
                      className={`px-2 py-1 rounded border ${
                        isDark
                          ? "border-green-400 text-green-300"
                          : "border-green-400 text-green-700 bg-green-100"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className={`rounded-md p-2 ${
                    isDark
                      ? "border border-amber-400/30 bg-amber-400/5"
                      : "border border-amber-300 bg-amber-50"
                  }`}
                >
                  <div
                    className={`text-[10px] mb-1 ${
                      isDark ? "text-amber-300" : "text-amber-700"
                    }`}
                  >
                    Query (Q) → input transformed with a fixed demo rule
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatVector(focusedData.query).map((v, i) => (
                      <span
                        key={`q-${i}`}
                        className={`px-2 py-1 rounded border ${
                          isDark
                            ? "border-amber-400 text-amber-300"
                            : "border-amber-400 text-amber-700 bg-amber-100"
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-md p-2 ${
                    isDark
                      ? "border border-pink-400/30 bg-pink-400/5"
                      : "border border-pink-300 bg-pink-50"
                  }`}
                >
                  <div
                    className={`text-[10px] mb-1 ${
                      isDark ? "text-pink-300" : "text-pink-700"
                    }`}
                  >
                    Key (K) → another transformed version of the same input
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatVector(focusedData.key).map((v, i) => (
                      <span
                        key={`k-${i}`}
                        className={`px-2 py-1 rounded border ${
                          isDark
                            ? "border-pink-400 text-pink-300"
                            : "border-pink-400 text-pink-700 bg-pink-100"
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-md p-2 ${
                    isDark
                      ? "border border-lime-400/30 bg-lime-400/5"
                      : "border border-lime-300 bg-lime-50"
                  }`}
                >
                  <div
                    className={`text-[10px] mb-1 ${
                      isDark ? "text-lime-300" : "text-lime-700"
                    }`}
                  >
                    Value (V) → the version used to pass information onward
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatVector(focusedData.value).map((v, i) => (
                      <span
                        key={`v-${i}`}
                        className={`px-2 py-1 rounded border ${
                          isDark
                            ? "border-lime-400 text-lime-300"
                            : "border-lime-400 text-lime-700 bg-lime-100"
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div
                className={`font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-900"
                }`}
              >
                Attention score matrix
              </div>

              <div
                className={`text-[11px] leading-5 mb-3 ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                Each cell compares the{" "}
                <span className={isDark ? "text-amber-300" : "text-amber-700"}>
                  Query
                </span>{" "}
                of the row word with the{" "}
                <span className={isDark ? "text-pink-300" : "text-pink-700"}>
                  Key
                </span>{" "}
                of the column word.
                <br />
                Higher score = stronger attention.
              </div>

              <div className="overflow-x-auto">
                <table className="text-[11px] border-collapse">
                  <thead>
                    <tr>
                      <th className={`px-2 py-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}></th>
                      {safeTokens.map((token, index) => (
                        <th
                          key={`col-${index}`}
                          className={`px-2 py-1 font-medium ${
                            isDark ? "text-cyan-300" : "text-blue-800"
                          }`}
                        >
                          {token}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {attentionMatrix.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`}>
                        <td
                          className={`px-2 py-1 font-medium ${
                            isDark ? "text-cyan-300" : "text-blue-800"
                          }`}
                        >
                          {safeTokens[rowIndex]}
                        </td>

                        {row.map((cell, colIndex) => {
                          const isDiagonal = rowIndex === colIndex;
                          const bgClass = isDiagonal
                            ? isDark
                              ? "bg-slate-800/90 text-white"
                              : "bg-slate-200 text-slate-900"
                            : cell.active
                            ? isDark
                              ? "bg-cyan-400/10 text-cyan-200"
                              : "bg-blue-100 text-blue-800"
                            : isDark
                            ? "bg-red-400/10 text-red-300"
                            : "bg-red-100 text-red-700";

                          return (
                            <td key={`cell-${rowIndex}-${colIndex}`} className="px-1 py-1">
                              <div
                                className={`min-w-[44px] text-center rounded border px-2 py-1 ${
                                  isDark ? "border-slate-700" : "border-slate-300"
                                } ${bgClass}`}
                              >
                                {cell.score.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className={`mt-3 text-[11px] leading-5 ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                Cyan cells = currently allowed graph connections.
                <br />
                Red cells = disconnected graph links, so that attention path is
                blocked in this demo.
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 leading-5 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60 text-slate-300"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                How the graph, Q/K/V, and matrix relate
              </div>

              1. The input vector creates{" "}
              <span className={isDark ? "text-amber-300" : "text-amber-700"}>Q</span>,{" "}
              <span className={isDark ? "text-pink-300" : "text-pink-700"}>K</span>, and{" "}
              <span className={isDark ? "text-lime-300" : "text-lime-700"}>V</span>.
              <br />
              <br />
              2. The matrix compares{" "}
              <span className={isDark ? "text-amber-300" : "text-amber-700"}>Q</span> of one word with{" "}
              <span className={isDark ? "text-pink-300" : "text-pink-700"}>K</span> of another word.
              <br />
              <br />
              3. The graph shows these attention relationships visually.
              <br />
              <br />
              4. Disconnecting a graph edge does{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>not</span> change Q, K, or V.
              It blocks that attention connection in the demo matrix instead.
            </div>
          </div>
        </div>

        <p
          className={`text-center text-sm pb-3 px-4 ${
            isDark ? "text-slate-400" : "text-slate-700"
          }`}
        >
          Cut links with the scissor to reduce word-to-word interaction in the demo.
          Double-tap one word, then another, to reconnect a cut link and restore that attention path.
        </p>

        <div
          ref={wrapRef}
          className="relative w-full"
          style={{ height: GRAPH_AREA_H, touchAction: "none" }}
        >
          <motion.div
            drag={false}
            onPointerDown={(e) => {
              e.preventDefault();
              setDragging(true);
              updateScissorFromPointer(e.clientX, e.clientY);
            }}
            animate={{
              x: scissorPos.x,
              y: scissorPos.y,
              rotate: dragging ? -20 : 0,
              scale: dragging ? 1.08 : 1,
            }}
            transition={{ duration: 0.15 }}
            className={`absolute z-20 w-[34px] h-[34px] rounded-full border flex items-center justify-center cursor-grab active:cursor-grabbing ${
              isDark
                ? "border-cyan-400 bg-slate-900 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                : "border-blue-300 bg-white shadow-[0_0_12px_rgba(59,130,246,0.18)]"
            }`}
            title="Drag to cut connections"
          >
            <span className={`text-lg leading-none ${isDark ? "text-cyan-300" : "text-blue-700"}`}>
              ✂
            </span>
          </motion.div>

          <svg width={BOX_W} height={GRAPH_AREA_H} className="absolute inset-0">
            <defs>
              <linearGradient
                id="attentionActiveLine"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {lineGeometries.map((line) => {
              if (line.active) {
                return (
                  <g key={line.key}>
                    <motion.line
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#22d3ee"
                      strokeWidth="1.8"
                      strokeDasharray="5 5"
                      animate={{
                        opacity: active ? 0.9 : 0.2,
                        strokeDashoffset: active ? [0, -12] : 0,
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.circle
                      r="2.6"
                      fill="#22d3ee"
                      animate={{
                        cx: active ? [line.x1, line.x2] : line.x1,
                        cy: active ? [line.y1, line.y2] : line.y1,
                        opacity: active ? [0, 1, 0] : 0,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </g>
                );
              }

              return (
                <line
                  key={line.key}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="7 6"
                  opacity="0.4"
                />
              );
            })}
          </svg>

          {positions.map((pos, index) => {
            const ratio = connectionRatioByNode[index];
            const color = getConnectionStateColor(ratio);
            const isSelected = selectedNode === index;
            const isFocused = focusedNode === index;

            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => handleNodeTap(index)}
                animate={{
                  x: pos.x - NODE_R,
                  y: pos.y - NODE_R,
                  scale: isSelected ? 1.08 : isFocused ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`absolute z-10 w-[56px] h-[56px] rounded-full border flex items-center justify-center text-sm font-semibold ${
                  isDark ? "bg-slate-900" : "bg-white"
                }`}
                style={{
                  borderColor: color.border,
                  color: color.text,
                  background: color.fill,
                  boxShadow: isSelected
                    ? `0 0 0 2px rgba(255,255,255,0.15), ${color.glow}`
                    : isFocused
                    ? `0 0 0 2px rgba(34,211,238,0.22), ${color.glow}`
                    : color.glow,
                }}
                title={`${safeTokens[index]} — ${Math.round(ratio * 100)}% connected`}
              >
                {safeTokens[index]}
              </motion.button>
            );
          })}

          <div
            className={`absolute bottom-4 left-4 text-[11px] space-y-1 ${
              isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            <div>
              <span className="text-green-400">●</span> 70%–100% connected
            </div>
            <div>
              <span className="text-amber-400">●</span> 50%–69% connected
            </div>
            <div>
              <span className="text-red-400">●</span> below 50% connected
            </div>
          </div>
        </div>
                <div className="mx-4 mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              What this graph means
            </div>

            <div
              className={`text-[11px] leading-5 space-y-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <p>
                Each circle is a word, and each link shows that one word can still
                exchange attention information with another word in this demo.
              </p>

              <p>
                When all links are connected, words can interact more freely across
                the sentence.
              </p>

              <p>
                When links are cut, some attention paths are blocked, so the graph
                becomes a visual way to understand reduced interaction between words.
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Live attention effect
            </div>

            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              <div
                className={`px-3 py-1.5 rounded-lg border ${
                  isDark
                    ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                    : "border-blue-400 text-blue-800 bg-blue-100"
                }`}
              >
                Active links: {activeEdgeCount} / {totalEdgeCount}
              </div>

              <div
                className={`px-3 py-1.5 rounded-lg border ${
                  isDark
                    ? "border-green-400 text-green-300 bg-green-400/10"
                    : "border-green-400 text-green-700 bg-green-100"
                }`}
              >
                Connectivity: {connectionPercent}%
              </div>

              <div
                className={`px-3 py-1.5 rounded-lg border ${
                  isDark
                    ? "border-purple-400 text-purple-300 bg-purple-400/10"
                    : "border-violet-400 text-violet-700 bg-violet-100"
                }`}
              >
                Focused word links: {focusedConnections}
              </div>
            </div>

            <div
              className={`text-[11px] leading-5 rounded-lg border p-3 ${
                allConnected
                  ? isDark
                    ? "border-green-400/40 bg-green-400/5 text-slate-300"
                    : "border-green-400 bg-green-50 text-slate-700"
                  : partiallyDisconnected
                  ? isDark
                    ? "border-amber-400/40 bg-amber-400/5 text-slate-300"
                    : "border-amber-400 bg-amber-50 text-slate-700"
                  : isDark
                  ? "border-red-400/40 bg-red-400/5 text-slate-300"
                  : "border-red-400 bg-red-50 text-slate-700"
              }`}
            >
              {allConnected && (
                <p>
                  All words are connected. In this state, the demo shows the richest
                  interaction pattern, because every word can still keep attention
                  paths to every other word.
                </p>
              )}

              {partiallyDisconnected && (
                <p>
                  Some links are cut. This means attention interaction is now more
                  limited: some word pairs can no longer exchange information through
                  the graph, so the matrix shows blocked relationships in red.
                </p>
              )}

              {heavilyDisconnected && (
                <p>
                  All links are cut. In this extreme case, the demo shows that words
                  lose interaction paths with each other, so attention becomes highly
                  restricted beyond self-connections.
                </p>
              )}
            </div>
          </div>
        </div>
        <div
          className={`mx-4 mt-4 rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-3 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Token Perspective Mode
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-cyan-400/30 bg-cyan-400/5"
                  : "border-blue-300 bg-blue-50"
              }`}
            >
              <div
                className={`text-[10px] uppercase tracking-wide mb-2 ${
                  isDark ? "text-cyan-300/80" : "text-blue-700"
                }`}
              >
                I am this word
              </div>
              <div
                className={`text-sm font-medium ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                {focusedWord}
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-green-400/30 bg-green-400/5"
                  : "border-green-400 bg-green-50"
              }`}
            >
              <div
                className={`text-[10px] uppercase tracking-wide mb-2 ${
                  isDark ? "text-green-300/80" : "text-green-700"
                }`}
              >
                I can still use
              </div>
              <div
                className={`text-sm ${
                  isDark ? "text-green-300" : "text-green-700"
                }`}
              >
                {connectedWords.join(", ") || "No other words"}
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-red-400/30 bg-red-400/5"
                  : "border-red-400 bg-red-50"
              }`}
            >
              <div
                className={`text-[10px] uppercase tracking-wide mb-2 ${
                  isDark ? "text-red-300/80" : "text-red-700"
                }`}
              >
                I lost access to
              </div>
              <div
                className={`text-sm ${
                  isDark ? "text-red-300" : "text-red-700"
                }`}
              >
                {disconnectedWords.join(", ") || "None"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs ${
                focusedUnderstandingLabel === "Strong output context"
                  ? isDark
                    ? "border-green-400 text-green-300 bg-green-400/10"
                    : "border-green-400 text-green-700 bg-green-100"
                  : focusedUnderstandingLabel === "Partial output context"
                  ? isDark
                    ? "border-amber-400 text-amber-300 bg-amber-400/10"
                    : "border-amber-400 text-amber-700 bg-amber-100"
                  : isDark
                  ? "border-red-400 text-red-300 bg-red-400/10"
                  : "border-red-400 text-red-700 bg-red-100"
              }`}
            >
              {focusedUnderstandingLabel}
            </div>
          </div>
        </div>
                <div
          className={`mx-4 mt-4 rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-3 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Attention Mistake Simulator
          </div>

          <div className="space-y-3">
            {mistakeMessages.map((message, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 text-[11px] leading-5 ${
                  disconnectedWords.length === 0
                    ? isDark
                      ? "border-green-400/30 bg-green-400/5 text-slate-300"
                      : "border-green-400 bg-green-50 text-slate-700"
                    : connectedWords.length === 0
                    ? isDark
                      ? "border-red-400/30 bg-red-400/5 text-slate-300"
                      : "border-red-400 bg-red-50 text-slate-700"
                    : isDark
                    ? "border-amber-400/30 bg-amber-400/5 text-slate-300"
                    : "border-amber-400 bg-amber-50 text-slate-700"
                }`}
              >
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AttentionStep ;     