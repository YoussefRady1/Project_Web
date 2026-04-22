import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- default rule set ---------- */

export const DEFAULT_RULES = {
  // Timing
  flowSpeed: 1.0, // multiplier (1x = base speed)
  stageDelay: 0.2, // stagger seconds between stages
  pulseSpeed: 2.5, // idle pulse period (seconds)
  autoPlay: true,

  // Visual
  lineThickness: 1.2, // base stroke width px
  lineOpacity: 0.45, // base stroke opacity
  dashPattern: "6 10", // SVG stroke-dasharray
  nodeSize: 1.0, // node radius multiplier

  // Structure toggles
  showResiduals: true,
  showCrossArc: true,

  // Filter rules
  probThreshold: 0.0, // hide output tokens below this probability
};

export const PRESETS = {
  Default: { ...DEFAULT_RULES },
  Calm: {
    ...DEFAULT_RULES,
    flowSpeed: 0.55,
    pulseSpeed: 4.0,
    lineOpacity: 0.3,
    dashPattern: "3 12",
    stageDelay: 0.35,
  },
  Energetic: {
    ...DEFAULT_RULES,
    flowSpeed: 2.2,
    stageDelay: 0.05,
    pulseSpeed: 1.2,
    lineThickness: 1.8,
    lineOpacity: 0.7,
    dashPattern: "8 6",
  },
  Minimal: {
    ...DEFAULT_RULES,
    showResiduals: false,
    showCrossArc: false,
    lineOpacity: 0.25,
    nodeSize: 0.85,
    dashPattern: "3 6",
  },
  Bold: {
    ...DEFAULT_RULES,
    lineThickness: 2.5,
    lineOpacity: 0.85,
    nodeSize: 1.25,
    dashPattern: "8 4",
    pulseSpeed: 1.8,
  },
};

const DASH_OPTIONS = {
  Dense: "3 6",
  Medium: "6 10",
  Sparse: "12 18",
  Long: "18 10",
};

/* ---------- sub-components ---------- */

function Section({ title, accent, children, isDark }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-300 bg-white"
      }`}
    >
      <div
        className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${accent}`}
      >
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Slider({ label, rule, value, min, max, step, onChange, suffix, isDark, accentClass }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <div>
          <div
            className={`text-[10.5px] font-semibold ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {label}
          </div>
          {rule && (
            <div
              className={`font-mono text-[9px] ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {rule}
            </div>
          )}
        </div>
        <span
          className={`text-[10.5px] font-bold tabular-nums ${accentClass}`}
        >
          {value.toFixed(step < 1 ? 2 : 1)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentClass.includes("cyan") ? "accent-cyan-500" : accentClass.includes("purple") ? "accent-purple-500" : accentClass.includes("amber") ? "accent-amber-500" : "accent-emerald-500"}`}
      />
    </div>
  );
}

function Toggle({ label, value, onChange, isDark, accentClass }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className={`w-3.5 h-3.5 rounded ${accentClass.includes("cyan") ? "accent-cyan-500" : accentClass.includes("purple") ? "accent-purple-500" : accentClass.includes("amber") ? "accent-amber-500" : "accent-emerald-500"}`}
      />
      <span
        className={`text-[10.5px] font-semibold ${
          isDark ? "text-slate-200" : "text-slate-700"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function Select({ label, value, options, onChange, isDark, accentClass }) {
  return (
    <div>
      <div
        className={`text-[10.5px] font-semibold mb-0.5 ${
          isDark ? "text-slate-200" : "text-slate-700"
        }`}
      >
        {label}
      </div>
      <div className="flex gap-1 flex-wrap">
        {Object.entries(options).map(([name, val]) => (
          <button
            key={name}
            onClick={() => onChange(val)}
            className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition border ${
              value === val
                ? isDark
                  ? `bg-slate-800 ${accentClass} border-current`
                  : `bg-slate-100 ${accentClass} border-current`
                : isDark
                ? "border-slate-700 text-slate-500 hover:text-slate-300"
                : "border-slate-300 text-slate-400 hover:text-slate-600"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- main editor ---------- */

export default function AnimationRuleEditor({ rules, setRules, isDark }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => setRules({ ...rules, [k]: v });
  const activePresetName = Object.keys(PRESETS).find((name) => {
    const preset = PRESETS[name];
    return Object.keys(preset).every((k) => preset[k] === rules[k]);
  });

  return (
    <div
      className={`rounded-xl border ${
        isDark
          ? "border-purple-500/30 bg-slate-900/40"
          : "border-purple-300 bg-purple-50/40"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2 text-left ${
          isDark ? "hover:bg-slate-800/40" : "hover:bg-purple-100/40"
        } transition`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold tracking-wider uppercase ${
              isDark ? "text-purple-300" : "text-purple-700"
            }`}
          >
            Animation Rules
          </span>
          <span
            className={`text-[10px] ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            {activePresetName
              ? `· preset: ${activePresetName}`
              : "· custom configuration"}
          </span>
        </div>
        <span
          className={`text-[11px] ${
            isDark ? "text-purple-400" : "text-purple-600"
          }`}
        >
          {open ? "▾" : "▸"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-3">
              {/* Preset bar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider mr-1 ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Presets:
                </span>
                {Object.keys(PRESETS).map((name) => (
                  <button
                    key={name}
                    onClick={() => setRules({ ...PRESETS[name] })}
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition border ${
                      activePresetName === name
                        ? isDark
                          ? "border-purple-400 text-purple-300 bg-purple-500/15"
                          : "border-purple-500 text-purple-700 bg-purple-100"
                        : isDark
                        ? "border-slate-700 text-slate-400 hover:border-slate-600"
                        : "border-slate-300 text-slate-500 hover:border-slate-400"
                    }`}
                  >
                    {name}
                  </button>
                ))}
                <button
                  onClick={() => setRules({ ...DEFAULT_RULES })}
                  className={`ml-auto px-2.5 py-0.5 rounded-md text-[10px] font-bold transition ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* Rule sections */}
              <div className="grid grid-cols-2 gap-2.5">
                <Section
                  title="Timing"
                  accent={isDark ? "text-cyan-300" : "text-cyan-700"}
                  isDark={isDark}
                >
                  <Slider
                    label="Flow speed"
                    rule="duration = base ÷ speed"
                    value={rules.flowSpeed}
                    min={0.25}
                    max={3}
                    step={0.05}
                    suffix="×"
                    onChange={(v) => update("flowSpeed", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-cyan-300" : "text-cyan-700"}
                  />
                  <Slider
                    label="Stage delay"
                    rule="delay[i] = stage_index × value"
                    value={rules.stageDelay}
                    min={0}
                    max={0.5}
                    step={0.01}
                    suffix="s"
                    onChange={(v) => update("stageDelay", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-cyan-300" : "text-cyan-700"}
                  />
                  <Slider
                    label="Pulse period"
                    rule="node_pulse.duration = value"
                    value={rules.pulseSpeed}
                    min={0.5}
                    max={6}
                    step={0.1}
                    suffix="s"
                    onChange={(v) => update("pulseSpeed", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-cyan-300" : "text-cyan-700"}
                  />
                  <Toggle
                    label="Auto-play (freezes animation when off)"
                    value={rules.autoPlay}
                    onChange={(v) => update("autoPlay", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-cyan-300" : "text-cyan-700"}
                  />
                </Section>

                <Section
                  title="Visual mapping"
                  accent={isDark ? "text-purple-300" : "text-purple-700"}
                  isDark={isDark}
                >
                  <Slider
                    label="Line thickness"
                    rule="stroke-width ∝ value"
                    value={rules.lineThickness}
                    min={0.5}
                    max={4}
                    step={0.1}
                    suffix="px"
                    onChange={(v) => update("lineThickness", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-purple-300" : "text-purple-700"}
                  />
                  <Slider
                    label="Line opacity"
                    rule="stroke-opacity ∝ value"
                    value={rules.lineOpacity}
                    min={0.1}
                    max={1}
                    step={0.05}
                    suffix=""
                    onChange={(v) => update("lineOpacity", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-purple-300" : "text-purple-700"}
                  />
                  <Slider
                    label="Node size"
                    rule="circle.r ∝ value"
                    value={rules.nodeSize}
                    min={0.5}
                    max={1.8}
                    step={0.05}
                    suffix="×"
                    onChange={(v) => update("nodeSize", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-purple-300" : "text-purple-700"}
                  />
                  <Select
                    label="Dash pattern"
                    value={rules.dashPattern}
                    options={DASH_OPTIONS}
                    onChange={(v) => update("dashPattern", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-purple-300" : "text-purple-700"}
                  />
                </Section>

                <Section
                  title="Structure"
                  accent={isDark ? "text-amber-300" : "text-amber-700"}
                  isDark={isDark}
                >
                  <Toggle
                    label="Show residual arcs (orange loops)"
                    value={rules.showResiduals}
                    onChange={(v) => update("showResiduals", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-amber-300" : "text-amber-700"}
                  />
                  <Toggle
                    label="Show encoder → decoder arc"
                    value={rules.showCrossArc}
                    onChange={(v) => update("showCrossArc", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-amber-300" : "text-amber-700"}
                  />
                  <div
                    className={`text-[9.5px] pt-1 border-t ${
                      isDark
                        ? "border-slate-800 text-slate-500"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    Toggle structural parts of the diagram on/off
                  </div>
                </Section>

                <Section
                  title="Conditional rules"
                  accent={isDark ? "text-emerald-300" : "text-emerald-700"}
                  isDark={isDark}
                >
                  <Slider
                    label="Hide outputs below probability"
                    rule="IF prob < threshold → hide token"
                    value={rules.probThreshold}
                    min={0}
                    max={0.5}
                    step={0.01}
                    suffix=""
                    onChange={(v) => update("probThreshold", v)}
                    isDark={isDark}
                    accentClass={isDark ? "text-emerald-300" : "text-emerald-700"}
                  />
                  <div
                    className={`text-[9.5px] pt-1 border-t ${
                      isDark
                        ? "border-slate-800 text-slate-500"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    Rules that filter elements based on data values
                  </div>
                </Section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
