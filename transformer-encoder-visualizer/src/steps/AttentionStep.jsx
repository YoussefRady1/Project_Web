import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const BOX_W = 980;

// Graph area constants — unchanged so all node/edge geometry is identical
const GRAPH_W = 620;
const GRAPH_H = 250;
const GRAPH_X = 20;
const GRAPH_Y = 60;           // reduced from 112 — title is now outside the graph area
const GRAPH_AREA_H = GRAPH_Y + GRAPH_H + 80; // dynamic-enough fixed height for the graph canvas

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

function AttentionStep({ active, tokens = [] }) {
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
  // Scissor starts near the graph area (top-right of graph canvas)
  const [scissorPos, setScissorPos] = useState({
    x: GRAPH_X + GRAPH_W - 50,
    y: 16,
  });
  const [dragging, setDragging] = useState(false);
  const [lastTap, setLastTap] = useState({ node: null, time: 0 });

  // wrapRef now points to the graph area div only
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

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT: vertical flex-column — explanation panel → instruction → graph area
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.97,
      }}
      transition={{ duration: 0.3 }}
      className="border border-cyan-500 rounded-2xl overflow-hidden"
      style={{ width: BOX_W }}   // height is now auto / dynamic
    >
      <div className="flex flex-col w-full bg-transparent select-none">

        {/* ── 1. Title ─────────────────────────────────────────────────────── */}
        <div className="pt-5 pb-3 text-center">
          <h2
            className="text-cyan-300 font-semibold"
            style={{ fontSize: "1.6rem" }}
          >
            Self-Attention
          </h2>
          <p className="text-slate-400 text-sm mt-1 leading-5">
            Each word compares itself with other words to decide what to focus on.
          </p>
        </div>

        {/* ── 2. Explanation / details panel (full-width, no scroll) ────────── */}
        <div
          className="mx-4 mb-3 rounded-xl border border-slate-700 bg-slate-900/95 p-4"
          style={{ touchAction: "auto" }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <div className="text-cyan-300 text-sm font-semibold">
                Attention details
              </div>
              <div className="text-[11px] text-slate-500">
                Focused word:{" "}
                <span className="text-white">{focusedData.word}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-right leading-4">
              Click any word
              <br />
              to inspect it
            </div>
          </div>

          <div className="space-y-3 text-[11px]">
            {/* Input from Positional Encoding */}
            <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-3">
              <div className="text-cyan-300 font-medium mb-1">
                Input from Positional Encoding
              </div>
              <div className="text-slate-300 leading-5">
                Input vector = Embedding + Position
              </div>

              <div className="mt-2 flex items-center gap-2 whitespace-nowrap overflow-x-auto">
  <div className="flex gap-1">
    {formatVector(focusedData.embedding).map((v, i) => (
      <span
        key={`emb-${i}`}
        className="px-2 py-1 rounded border border-cyan-400 text-cyan-300"
      >
        {v}
      </span>
    ))}
  </div>

  <span className="text-cyan-400">+</span>

  <div className="flex gap-1">
    {formatVector(focusedData.positional).map((v, i) => (
      <span
        key={`pos-${i}`}
        className="px-2 py-1 rounded border border-purple-400 text-purple-300"
      >
        {v}
      </span>
    ))}
  </div>

  <span className="text-cyan-400">→</span>

  <div className="flex gap-1">
    {formatVector(focusedData.input).map((v, i) => (
      <span
        key={`inp-${i}`}
        className="px-2 py-1 rounded border border-green-400 text-green-300"
      >
        {v}
      </span>
    ))}
  </div>
</div>
            </div>

            {/* Q, K, V */}
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <div className="text-slate-300 font-medium mb-2">
                Q, K, V from the input vector
              </div>

              <div className="text-[11px] text-slate-400 leading-5 mb-3">
                The same input vector is transformed into three versions:
                <br />
                <span className="text-amber-300">Q (Query)</span> = what this word is looking for
                <br />
                <span className="text-pink-300">K (Key)</span> = what this word offers to other words
                <br />
                <span className="text-lime-300">V (Value)</span> = the information passed forward
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2 mb-3">
                <div className="text-[10px] text-slate-500 mb-1">Focused input vector</div>
                <div className="flex flex-wrap gap-1">
                  {formatVector(focusedData.input).map((v, i) => (
                    <span
                      key={`input-show-${i}`}
                      className="px-2 py-1 rounded border border-green-400 text-green-300"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-amber-400/30 rounded-md p-2 bg-amber-400/5">
                  <div className="text-[10px] text-amber-300 mb-1">
                    Query (Q) → input transformed with a fixed demo rule
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatVector(focusedData.query).map((v, i) => (
                      <span
                        key={`q-${i}`}
                        className="px-2 py-1 rounded border border-amber-400 text-amber-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-pink-400/30 rounded-md p-2 bg-pink-400/5">
                  <div className="text-[10px] text-pink-300 mb-1">
                    Key (K) → another transformed version of the same input
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatVector(focusedData.key).map((v, i) => (
                      <span
                        key={`k-${i}`}
                        className="px-2 py-1 rounded border border-pink-400 text-pink-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-lime-400/30 rounded-md p-2 bg-lime-400/5">
                  <div className="text-[10px] text-lime-300 mb-1">
                    Value (V) → the version used to pass information onward
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatVector(focusedData.value).map((v, i) => (
                      <span
                        key={`v-${i}`}
                        className="px-2 py-1 rounded border border-lime-400 text-lime-300"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attention score matrix */}
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
              <div className="text-slate-300 font-medium mb-2">
                Attention score matrix
              </div>

              <div className="text-[11px] text-slate-400 leading-5 mb-3">
                Each cell compares the{" "}
                <span className="text-amber-300">Query</span> of the row word
                with the{" "}
                <span className="text-pink-300">Key</span> of the column word.
                <br />
                Higher score = stronger attention.
              </div>

              <div className="overflow-x-auto">
                <table className="text-[11px] border-collapse">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-slate-500"></th>
                      {safeTokens.map((token, index) => (
                        <th
                          key={`col-${index}`}
                          className="px-2 py-1 text-cyan-300 font-medium"
                        >
                          {token}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {attentionMatrix.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`}>
                        <td className="px-2 py-1 text-cyan-300 font-medium">
                          {safeTokens[rowIndex]}
                        </td>

                        {row.map((cell, colIndex) => {
                          const isDiagonal = rowIndex === colIndex;
                          const bgClass = isDiagonal
                            ? "bg-slate-800/90 text-white"
                            : cell.active
                            ? "bg-cyan-400/10 text-cyan-200"
                            : "bg-red-400/10 text-red-300";

                          return (
                            <td
                              key={`cell-${rowIndex}-${colIndex}`}
                              className="px-1 py-1"
                            >
                              <div
                                className={`min-w-[44px] text-center rounded border border-slate-700 px-2 py-1 ${bgClass}`}
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

              <div className="mt-3 text-[11px] text-slate-400 leading-5">
                Cyan cells = currently allowed graph connections.
                <br />
                Red cells = disconnected graph links, so that attention path is
                blocked in this demo.
              </div>
            </div>

            {/* How the graph, Q/K/V, and matrix relate */}
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-slate-300 leading-5">
              <div className="text-cyan-300 font-medium mb-1">
                How the graph, Q/K/V, and matrix relate
              </div>

              1. The input vector creates{" "}
              <span className="text-amber-300">Q</span>,{" "}
              <span className="text-pink-300">K</span>, and{" "}
              <span className="text-lime-300">V</span>.
              <br />
              <br />
              2. The matrix compares{" "}
              <span className="text-amber-300">Q</span> of one word with{" "}
              <span className="text-pink-300">K</span> of another word.
              <br />
              <br />
              3. The graph shows these attention relationships visually.
              <br />
              <br />
              4. Disconnecting a graph edge does{" "}
              <span className="text-white">not</span> change Q, K, or V.
              It blocks that attention connection in the demo matrix instead.
            </div>
          </div>
        </div>

        {/* ── 3. Scissor instruction (between panel and graph) ──────────────── */}
        <p className="text-center text-slate-400 text-sm pb-3 px-4">
          Cut links with the scissor. Double-tap one word, then another, to
          reconnect a cut link.
        </p>

        {/* ── 4. Graph area — relative container, fixed height ─────────────── */}
        {/*      wrapRef lives here so scissor coords are local to this div     */}
        <div
          ref={wrapRef}
          className="relative w-full"
          style={{ height: GRAPH_AREA_H, touchAction: "none" }}
        >
          {/* Scissor */}
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
            className="absolute z-20 w-[34px] h-[34px] rounded-full border border-cyan-400 bg-slate-900 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_12px_rgba(34,211,238,0.35)]"
            title="Drag to cut connections"
          >
            <span className="text-cyan-300 text-lg leading-none">✂</span>
          </motion.div>

          {/* SVG graph */}
          <svg
            width={BOX_W}
            height={GRAPH_AREA_H}
            className="absolute inset-0"
          >
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

            {/* Lines */}
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

          {/* Nodes */}
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
                className="absolute z-10 w-[56px] h-[56px] rounded-full border bg-slate-900 flex items-center justify-center text-sm font-semibold"
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

          {/* Legend — bottom-left of graph area */}
          <div className="absolute bottom-4 left-4 text-[11px] text-slate-400 space-y-1">
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
        {/* ── end graph area ─────────────────────────────────────────────────── */}

      </div>
    </motion.div>
  );
}

export default AttentionStep;