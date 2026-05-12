import { useState, useMemo, useRef, useEffect } from "react";
import { PAGE_CONFIG } from "../visualizers/MainCanvas";

function StepSearch({ setStep, theme }) {
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PAGE_CONFIG.map((p, i) => ({
      index: i,
      title: p.title,
      label: p.label,
      haystack: `${p.title} ${p.label} ${p.section} ${p.keywords || ""}`.toLowerCase(),
    }))
      .filter((m) => m.haystack.includes(q))
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goTo = (idx) => {
    setStep(idx);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (matches.length > 0) goTo(matches[0].index);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length > 0;
  const noResults = showDropdown && matches.length === 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
          isDark
            ? "border-cyan-400/40 bg-slate-900/60 focus-within:border-cyan-300"
            : "border-white/40 bg-white/15 focus-within:border-white"
        }`}
      >
        <span className={isDark ? "text-cyan-300/70" : "text-white/70"}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search steps..."
          className={`bg-transparent outline-none text-sm w-44 ${
            isDark
              ? "text-cyan-100 placeholder:text-slate-500"
              : "text-white placeholder:text-white/60"
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className={`text-xs ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-white/60 hover:text-white"
            }`}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className={`absolute right-0 mt-1 w-72 rounded-lg border shadow-lg overflow-hidden z-50 ${
            isDark
              ? "border-cyan-500/40 bg-slate-900/95 backdrop-blur"
              : "border-slate-300 bg-white"
          }`}
        >
          {noResults ? (
            <div
              className={`px-3 py-3 text-sm text-center ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Not found
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {matches.map((m) => (
                <li key={m.index}>
                  <button
                    onClick={() => goTo(m.index)}
                    className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 transition ${
                      isDark
                        ? "hover:bg-cyan-400/10 text-slate-200"
                        : "hover:bg-blue-50 text-slate-800"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
                      {m.title}
                    </span>
                    <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      {m.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default StepSearch;
