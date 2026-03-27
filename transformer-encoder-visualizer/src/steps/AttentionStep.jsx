import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const BOX_W = 760;
const BOX_H = 340;
const GRAPH_W = 700;
const GRAPH_H = 250;
const GRAPH_X = 30;
const GRAPH_Y = 90;
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
  if (safeCount <= 2) radius = 85;
  else if (safeCount <= 4) radius = 78;
  else if (safeCount <= 6) radius = 72;
  else if (safeCount <= 8) radius = 66;
  else radius = 60;

  return Array.from({ length: safeCount }).map((_, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / safeCount;
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

function AttentionStep({ active, tokens = [] }) {
  const safeTokens = tokens.length ? tokens.slice(0, 10) : ["token"];
  const positions = useMemo(() => getNodePositions(safeTokens.length), [safeTokens.length]);

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
  const [scissorPos, setScissorPos] = useState({
    x: BOX_W - 72,
    y: 34,
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

    const clampedX = Math.max(12, Math.min(BOX_W - SCISSOR_SIZE - 12, localX - SCISSOR_SIZE / 2));
    const clampedY = Math.max(12, Math.min(BOX_H - SCISSOR_SIZE - 12, localY - SCISSOR_SIZE / 2));

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

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.97,
      }}
      transition={{ duration: 0.3 }}
      className="p-0 border border-cyan-500 rounded-2xl overflow-hidden"
      style={{ width: BOX_W, height: BOX_H }}
    >
      <div
        ref={wrapRef}
        className="relative w-full h-full bg-transparent select-none"
        style={{ touchAction: "none" }}
      >
        {/* Title */}
        <div className="absolute top-6 left-0 right-0 text-center">
          <h2 className="text-cyan-300 font-semibold text-3xl" style={{ fontSize: "1.75rem" }}>
            Self-Attention
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            (Each word focuses on other words)<br />
            Cut links with the scissor. Double-tap one neuron, then another, to reconnect a cut link.
          </p>
        </div>

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
          height={BOX_H}
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id="attentionActiveLine" x1="0%" y1="0%" x2="100%" y2="100%">
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
                    stroke="url(#attentionActiveLine)"
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

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleNodeTap(index)}
              animate={{
                x: pos.x - NODE_R,
                y: pos.y - NODE_R,
                scale: isSelected ? 1.08 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-[56px] h-[56px] rounded-full border bg-slate-900 flex items-center justify-center text-sm font-semibold"
              style={{
                borderColor: color.border,
                color: color.text,
                background: color.fill,
                boxShadow: isSelected
                  ? `0 0 0 2px rgba(255,255,255,0.15), ${color.glow}`
                  : color.glow,
              }}
              title={`${safeTokens[index]} — ${Math.round(ratio * 100)}% connected`}
            >
              {safeTokens[index]}
            </motion.button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 text-[11px] text-slate-400 space-y-1">
          <div><span className="text-green-400">●</span> 70%–100% connected</div>
          <div><span className="text-amber-400">●</span> 50%–69% connected</div>
          <div><span className="text-red-400">●</span> below 50% connected</div>
        </div>
      </div>
    </motion.div>
  );
}

export default AttentionStep;