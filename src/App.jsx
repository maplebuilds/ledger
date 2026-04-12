import React, { useState, useEffect, useCallback } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const NOW = new Date();
const CUR_MONTH = NOW.getMonth();
const CUR_YEAR = NOW.getFullYear();
const VISUAL_MAX = 1000;

const TXN_CATEGORIES = [
  { key: "food",      label: "Food & Dining",     varKey: "Food & Dining",    color: "#22c55e" },
  { key: "groceries", label: "Groceries",          varKey: "Groceries",        color: "#22c55e" },
  { key: "gas",       label: "Gas",                varKey: "Gas",              color: "#3b82f6" },
  { key: "personal",  label: "Personal Care",      varKey: "Personal Care",    color: "#8b5cf6" },
  { key: "health",    label: "Health & Fitness",   varKey: "Health & Fitness", color: "#8b5cf6" },
  { key: "entertain", label: "Entertainment",      varKey: "Entertainment",    color: "#f59e0b" },
  { key: "shopping",  label: "Shopping",  varKey: "Shopping",color: "#ec4899" },
  { key: "cash",      label: "ATM Withdrawals",    varKey: "ATM Withdrawals",  color: "#94a3b8" },
  { key: "business",  label: "Business Services",  varKey: "Business Services",color: "#f97316" },
  { key: "other",     label: "Other",              varKey: "Other",            color: "#64748b" },
];

const FIXED_DEFAULTS = [
  { name: "Rent / Mortgage", amount: 0, cat: "housing" },
  { name: "Car Payment", amount: 0, cat: "auto" },
  { name: "Electric", amount: 0, cat: "utilities" },
  { name: "Internet", amount: 0, cat: "utilities" },
];

const INCOME_DEFAULTS = [
  { name: "Primary Income", amount: 0, frequency: "monthly", type: "recurring", note: "" },
];

const FREQ_MULTIPLIER = { weekly: 4, biweekly: 2, monthly: 1 };
const FREQ_LABELS = { weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly" };

function monthlyAmount(src) {
  return src.amount * (FREQ_MULTIPLIER[src.frequency || "monthly"] || 1);
}


const PLANNED_DEFAULTS = [];

const VARIABLE_DEFAULTS = [
  { name: "Groceries", cat: "food", max: 600 },
  { name: "Food & Dining", cat: "food", max: 700 },
  { name: "Gas", cat: "transport", max: 400 },
  { name: "Personal Care", cat: "personal", max: 200 },
  { name: "Health & Fitness", cat: "personal", max: 200 },
  { name: "Entertainment", cat: "lifestyle", max: 400 },
  { name: "ATM Withdrawals", cat: "cash", max: 500 },
  { name: "Business Services", cat: "business", max: 500 },
  { name: "Shopping", cat: "shopping", max: 1000 },
  { name: "Other", cat: "other", max: 0 },
];

const FIXED_CATS = {
  housing:       { label: "Housing",       color: "#f97316" },
  debt:          { label: "Debt",          color: "#ef4444" },
  auto:          { label: "Auto",          color: "#10b981" },
  utilities:     { label: "Utilities",     color: "#3b82f6" },
  insurance:     { label: "Insurance",     color: "#8b5cf6" },
  subscriptions: { label: "Subscriptions", color: "#06b6d4" },
};

const VAR_CATS = {
  food:      { label: "Food",      color: "#22c55e" },
  transport: { label: "Transport", color: "#3b82f6" },
  personal:  { label: "Personal",  color: "#8b5cf6" },
  lifestyle: { label: "Lifestyle", color: "#f59e0b" },
  shopping:  { label: "Shopping",  color: "#ec4899" },
  cash:      { label: "Cash",       color: "#94a3b8" },
  business:  { label: "Business",   color: "#f97316" },
  other:     { label: "Other",      color: "#64748b" },
};

const THEMES_CONFIG = {
  midnight: {
    pageBg: "#0d0d1a", cardBg: "#111827", cardBg2: "#0a0a14", inputBg: "#1e293b",
    border: "#1e293b", border2: "#334155",
    accent: "#a78bfa", accentDim: "#1e1040", accentBorder: "#a78bfa44", accentText: "#a78bfa",
    textPrimary: "#f1f5f9", textSecondary: "#94a3b8", textMuted: "#64748b", textDim: "#475569",
    heroGradient: "linear-gradient(135deg, #0f0a1e 0%, #1e1b4b 40%, #312e81 60%, #0d0d1a 100%)",
    orb1: "rgba(139,92,246,0.12)", orb2: "rgba(99,102,241,0.1)", orb3: "rgba(167,139,250,0.08)",
    glowPos: "rgba(167,139,250,0.85)", glowNeg: "rgba(239,68,68,0.85)",
    pillBg: "#0d0d1a", tabBg: "#111827", progressBg: "#1e293b",
  },
  ocean: {
    pageBg: "#dbeeff", cardBg: "#ffffff", cardBg2: "#eef6ff", inputBg: "#f0f8ff",
    border: "#bfdbfe", border2: "#93c5fd",
    accent: "#0284c7", accentDim: "#dbeeff", accentBorder: "#0284c744", accentText: "#0369a1",
    textPrimary: "#0c1929", textSecondary: "#1e4060", textMuted: "#3a6080", textDim: "#5a80a0",
    heroGradient: "linear-gradient(135deg, #ffffff 0%, #bfdbfe 30%, #7dd3fc 65%, #0284c7 100%)",
    orb1: "rgba(2,132,199,0.15)", orb2: "rgba(255,255,255,0.4)", orb3: "rgba(14,165,233,0.12)",
    glowPos: "rgba(2,132,199,0.85)", glowNeg: "rgba(239,68,68,0.85)",
    pillBg: "#dbeeff", tabBg: "#ffffff", progressBg: "#bfdbfe",
    isLight: true,
  },
  ember: {
    pageBg: "#0d0500", cardBg: "#1a0a00", cardBg2: "#0d0500", inputBg: "#2d1500",
    border: "#2d1500", border2: "#3d1f00",
    accent: "#f97316", accentDim: "#2e1000", accentBorder: "#f9731644", accentText: "#fb923c",
    textPrimary: "#fef3e2", textSecondary: "#fed7aa", textMuted: "#c2845a", textDim: "#92532a",
    heroGradient: "linear-gradient(135deg, #1c0500 0%, #7c2d12 40%, #431407 70%, #0d0500 100%)",
    orb1: "rgba(249,115,22,0.12)", orb2: "rgba(239,68,68,0.1)", orb3: "rgba(245,158,11,0.08)",
    glowPos: "rgba(249,115,22,0.85)", glowNeg: "rgba(239,68,68,0.85)",
    pillBg: "#0d0500", tabBg: "#1a0a00", progressBg: "#2d1500",
  },
  forest: {
    pageBg: "#020b04", cardBg: "#061a09", cardBg2: "#020b04", inputBg: "#0d2e12",
    border: "#0d2e12", border2: "#1a4d20",
    accent: "#22c55e", accentDim: "#052e0d", accentBorder: "#22c55e44", accentText: "#4ade80",
    textPrimary: "#ecfdf5", textSecondary: "#a7f3d0", textMuted: "#6ee7b7", textDim: "#34d399",
    heroGradient: "linear-gradient(135deg, #022c0a 0%, #065f1a 40%, #047857 70%, #020b04 100%)",
    orb1: "rgba(34,197,94,0.1)", orb2: "rgba(4,120,87,0.12)", orb3: "rgba(16,185,129,0.08)",
    glowPos: "rgba(34,197,94,0.85)", glowNeg: "rgba(239,68,68,0.85)",
    pillBg: "#020b04", tabBg: "#061a09", progressBg: "#0d2e12",
  },
};

const TABS = ["Dashboard", "Income", "Expenses", "Spending Log", "Savings", "Net Worth"];
let T = THEMES_CONFIG.midnight;
let CURRENT_YEAR = CUR_YEAR;
const FIXED_CAT_ORDER = ["housing","debt","auto","utilities","insurance","subscriptions"];
const VAR_CAT_ORDER = ["transport","lifestyle","shopping","cash","business","personal","food","other"];

function fmt(n) {
  return "$" + Math.round(n).toLocaleString();
}


function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

function ProgressBar({ value, color }) {
  const pct = Math.min((value / VISUAL_MAX) * 100, 100);
  const barColor = pct > 80 ? "#ef4444" : pct > 60 ? "#f59e0b" : color;
  return (
    <div style={{ height: 4, background: "var(--bg-page)", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 2, transition: "width 0.2s" }} />
    </div>
  );
}

function MetricSquares({ income, totalFixed, totalVar, totalOut, remaining, dailyBudget, dailyLabel, large, isMobile }) {
  const totalPct = income > 0 ? Math.min((totalOut / income) * 100, 100) : 0;
  const outColor = totalPct > 90 ? "#ef4444" : totalPct > 75 ? "#f59e0b" : "var(--text-pri)";
  const remColor = remaining >= 0 ? "#4ade80" : "#ef4444";
  const dayColor = dailyBudget < 0 ? "#ef4444" : dailyBudget < 20 ? "#f59e0b" : "#94a3b8";
  const items = [
    { label: "Income",        value: fmt(income),        color: "#4ade80"           },
    { label: "Fixed Costs",   value: fmt(totalFixed),    color: "var(--text-pri)"   },
    { label: "Variable Costs",value: fmt(totalVar),      color: "var(--text-pri)"   },
    { label: "Total Expenses",value: fmt(totalOut),      color: outColor            },
    { label: "Net",           value: (remaining >= 0 ? "+" : "") + fmt(remaining), color: remColor },
    { label: "Daily Budget",  value: fmt(dailyBudget),   color: dayColor, sub: dailyLabel },
  ];
  if (large) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {items.map(m => (
          <div key={m.label} style={{ background: "var(--bg-card)", borderRadius: 12, padding: isMobile ? "10px 12px" : "14px 16px", border: `1px solid ${T.border}`, textAlign: "left" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ fontSize: isMobile ? 22 : 32, fontWeight: 700, color: m.color, letterSpacing: "-0.02em" }}>{m.value}</div>
              {m.sub && <div style={{ fontSize: 10, color: "var(--text-dim)", flexShrink: 0 }}>{m.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="metric-strip" style={{ marginBottom: 16 }}>
      {items.map(m => (
        <div key={m.label} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "10px 12px", border: `1px solid ${T.border}`, textAlign: "left" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: m.color }}>{m.value}</div>
            {m.sub && <div style={{ fontSize: 9, color: "var(--text-dim)", flexShrink: 0 }}>{m.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpendBar({ totalFixed, totalOut, income }) {
  const fixedPct = income > 0 ? Math.min((totalFixed / income) * 100, 100) : 0;
  const totalPct = income > 0 ? Math.min((totalOut / income) * 100, 100) : 0;
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "12px 20px", border: `1px solid ${T.border}`, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-mute)" }}>fixed <span style={{ color: "#3b82f6", fontWeight: 600 }}>{Math.round(fixedPct)}%</span></span>
        <span style={{ fontSize: 11, color: "var(--text-mute)" }}>total out <span style={{ color: totalPct > 90 ? "#ef4444" : totalPct > 75 ? "#f59e0b" : "#8b5cf6", fontWeight: 600 }}>{Math.round(totalPct)}%</span></span>
      </div>
      <div style={{ height: 10, background: "var(--bg-page)", borderRadius: 5, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: `${totalPct}%`, height: "100%", background: totalPct > 90 ? "#ef4444" : totalPct > 75 ? "#f59e0b" : "#8b5cf6", borderRadius: 5, transition: "width 0.4s" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: `${fixedPct}%`, height: "100%", background: "#3b82f6", borderRadius: 5, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function CatSummaryCard({ cat, items, cats }) {
  const [expanded, setExpanded] = useState(false);
  const meta = (cats || {})[cat] || { label: cat, color: "var(--text-mute)" };
  const total = items.reduce((s, i) => s + i.effectiveAmount, 0);
  return (
    <div onClick={() => setExpanded(e => !e)} style={{ background: "var(--bg-card)", border: `1px solid ${expanded ? meta.color + "66" : meta.color + "22"}`, borderRadius: 12, padding: "18px 16px", cursor: "pointer", transition: "border 0.2s" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", marginBottom: expanded ? 14 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: meta.color }}>{meta.label}</span>
          <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: 4 }}>{expanded ? "▲" : "▼"}</span>
        </div>
        <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text-pri)", letterSpacing: "-0.02em" }}>{fmt(total)}</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>/mo</span>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${meta.color}22`, paddingTop: 12 }} onClick={e => e.stopPropagation()}>
          {items.map(item => (
            <div key={item.name} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 6, marginBottom: 6, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: item.isPlanned ? "#f59e0b" : "#94a3b8" }}>
                {item.name}{item.isPlanned ? " ✦" : ""}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: item.isPlanned ? "#f59e0b" : "#cbd5e1" }}>{fmt(item.effectiveAmount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VarSummaryCard({ cat, items, prevVariables, cats }) {
  const [expanded, setExpanded] = useState(false);
  const meta = (cats || {})[cat] || { label: cat, color: "var(--text-mute)" };
  const total = Math.round(items.reduce((s, v) => s + v.value, 0) * 100) / 100;
  return (
    <div onClick={() => setExpanded(e => !e)} style={{ background: "var(--bg-card)", border: `1px solid ${expanded ? meta.color + "66" : meta.color + "22"}`, borderRadius: 12, padding: "18px 16px", cursor: "pointer", transition: "border 0.2s" }}>
      {(() => {
        const prevTotal = prevVariables ? items.reduce((s, v) => s + (prevVariables[v.name] || 0), 0) : null;
        const pctChange = (prevTotal !== null && prevTotal > 0) ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;
        const isUp = pctChange > 0;
        const isDown = pctChange < 0;
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", marginBottom: expanded ? 14 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: meta.color }}>{meta.label}</span>
              <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: 4 }}>{expanded ? "▲" : "▼"}</span>
            </div>
            <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text-pri)", letterSpacing: "-0.02em" }}>{fmt(total)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>/mo</span>
              {pctChange !== null && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 99,
                  background: isUp ? "#2e0f0f" : isDown ? "#0f2e1a" : "#1e293b",
                  color: isUp ? "#ef4444" : isDown ? "#4ade80" : "#64748b",
                }}>
                  {isUp ? "▲" : isDown ? "▼" : "–"}{" "}{pctChange !== 0 ? `${Math.abs(pctChange)}%` : "0%"}
                </span>
              )}
            </div>
          </div>
        );
      })()}
      {expanded && (
        <div style={{ borderTop: `1px solid ${meta.color}22`, paddingTop: 12 }} onClick={e => e.stopPropagation()}>
          {items.map(v => {
            const prevVal = prevVariables ? (prevVariables[v.name] || 0) : null;
            const itemPct = (prevVal !== null && prevVal > 0) ? Math.round(((v.value - prevVal) / prevVal) * 100) : null;
            const itemUp = itemPct > 0;
            return (
              <div key={v.name} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-sec)" }}>{v.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {itemPct !== null && (
                      <span style={{ fontSize: 10, color: itemUp ? "#ef4444" : "#4ade80" }}>
                        {itemUp ? "▲" : "▼"}{Math.abs(itemPct)}%
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-sec)" }}>{fmt(v.value)}</span>
                  </div>
                </div>
                <ProgressBar value={v.value} color={meta.color} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MonthlyChart({ allData }) {
  const [slide, setSlide] = React.useState(0);
  const points = [];
  const MLABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let m = 0; m < 12; m++) {
    const key = `budget_${CURRENT_YEAR}_${m}`;
    const d = allData[key];
    if (!d || d._chartNet === undefined) continue;
    points.push({ month: m, label: MLABELS[m], remaining: d._chartNet, totalSubs: d._chartSubs || 0, totalVar: d._chartVar || 0 });
  }

  if (points.length < 2) return (
    <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "20px", border: `1px solid ${T.border}`, marginBottom: 24, textAlign: "left" }}>
      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Enter data for at least 2 months to see the trend chart</div>
    </div>
  );

  const W = 600, H = 180, PAD = { top: 20, right: 20, bottom: 30, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Slide 0: Net line chart
  const netChart = () => {
    const vals = points.map(p => p.remaining);
    const minVal = Math.min(...vals, 0);
    const maxVal = Math.max(...vals, 0);
    const range = maxVal - minVal || 1;
    const toX = i => PAD.left + (i / (points.length - 1)) * innerW;
    const toY = v => PAD.top + innerH - ((v - minVal) / range) * innerH;
    const zeroY = toY(0);
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.remaining)}`).join(" ");
    const areaD = `${pathD} L ${toX(points.length-1)} ${zeroY} L ${toX(0)} ${zeroY} Z`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 300, display: "block" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = PAD.top + innerH * t;
          const v = maxVal - t * range;
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1e293b" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#475569">
                {v >= 0 ? "+" : ""}{Math.abs(v) >= 1000 ? `$${Math.round(v/1000*10)/10}k` : `$${Math.round(v)}`}
              </text>
            </g>
          );
        })}
        {minVal < 0 && maxVal > 0 && <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="#334155" strokeWidth="1.5" strokeDasharray="4,3" />}
        <path d={areaD} fill="url(#areaGrad)" opacity="0.8" />
        <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const x = toX(i); const y = toY(p.remaining); const isPos = p.remaining >= 0;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={isPos ? "#4ade80" : "#ef4444"} stroke="#0d0d1a" strokeWidth="1.5" />
              <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#64748b">{p.label}</text>
              <text x={x} y={y - 10} textAnchor="middle" fontSize="8" fill={isPos ? "#4ade80" : "#ef4444"}>
                {isPos ? "+" : ""}{Math.abs(p.remaining) >= 1000 ? `$${Math.round(p.remaining/1000*10)/10}k` : `$${Math.round(p.remaining)}`}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Slide 1: Stacked bar chart (Variable + Subs only)
  const barChart = () => {
    const maxTotal = Math.max(...points.map(p => p.totalSubs + p.totalVar), 1);
    const bw = innerW / points.length;
    const barW = bw * 0.6;
    const toY = v => PAD.top + innerH - (v / maxTotal) * innerH;
    const toH = v => (v / maxTotal) * innerH;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 300, display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = PAD.top + innerH * (1 - t);
          const v = maxTotal * t;
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1e293b" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#475569">
                {v >= 1000 ? `$${Math.round(v/1000*10)/10}k` : `$${Math.round(v)}`}
              </text>
            </g>
          );
        })}
        {points.map((p, i) => {
          const x = PAD.left + i * bw + (bw - barW) / 2;
          const subsH = toH(p.totalSubs);
          const varH = toH(p.totalVar);
          const total = p.totalSubs + p.totalVar;
          return (
            <g key={i}>
              <rect x={x} y={toY(p.totalSubs + p.totalVar)} width={barW} height={subsH} fill="#a78bfa" rx="2" />
              <rect x={x} y={toY(p.totalVar)} width={barW} height={varH} fill="#38bdf8" rx="2" />
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#64748b">{p.label}</text>
              <text x={x + barW / 2} y={toY(total) - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">
                {total >= 1000 ? `$${Math.round(total/1000*10)/10}k` : `$${Math.round(total)}`}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const titles = ["Net", "Variable + Subs"];
  const legends = [
    null,
    [{ color: "#a78bfa", label: "Subs" }, { color: "#38bdf8", label: "Variable" }]
  ];

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "16px 20px", border: `1px solid ${T.border}`, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase" }}>{titles[slide]}</div>
          {legends[slide] && (
            <div style={{ display: "flex", gap: 10 }}>
              {legends[slide].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 9, color: "var(--text-dim)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
            style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: slide === 0 ? "var(--text-dim)" : "var(--text-sec)", cursor: slide === 0 ? "default" : "pointer", fontFamily: "inherit", opacity: slide === 0 ? 0.4 : 1 }}>‹</button>
          <button onClick={() => setSlide(s => Math.min(1, s + 1))} disabled={slide === 1}
            style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: slide === 1 ? "var(--text-dim)" : "var(--text-sec)", cursor: slide === 1 ? "default" : "pointer", fontFamily: "inherit", opacity: slide === 1 ? 0.4 : 1 }}>›</button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        {slide === 0 ? netChart() : barChart()}
      </div>
    </div>
  );
}

function autoCategory(name, customCats) {
  const n = name.toLowerCase().replace(/ +/g, " ").trim();
  // Check custom categories first (user-defined terms match by name)
  if (customCats) {
    for (const item of customCats) {
      if (n.includes(item.name.toLowerCase())) return item.key;
    }
  }
  const rules = [
    { key: "groceries", terms: ["shoprite","shop rite","whole foods","trader joe","costco","walmart","target","aldi","wegmans","grocery","supermarket","market","food store","stop shop","kings","lidl","safeway"] },
    { key: "gas",       terms: ["exxon","shell","bp","wawa","sunoco","gulf","gas station","fuel","mobil","lukoil","nj fuel","chevron","citgo"] },
    { key: "worklunch", terms: ["wonder","grubhub","seamless","doordash","uber eats","work lunch","office lunch","cafeteria"] },
    { key: "food",      terms: ["restaurant","cafe","coffee","starbucks","dunkin","mcdonald","burger","pizza","sushi","chipotle","chick-fil","wendy","taco","subway","panera","cheesecake","applebee","outback","dining","bar ","tavern","grill","diner","bonefish","ihop","five guys","shake shack","jersey mike","wingstop","buffalo wild","food","lunch","dinner","breakfast","brunch","eatery","kitchen","bistro"] },
    { key: "shopping",  terms: ["amazon","amzn","ebay","etsy","best buy","apple store","nike","zara","h&m","nordstrom","macy","tj maxx","marshall","gap","uniqlo","asos","wayfair","home depot","ikea","b&h","newegg","gamestop","steam","playstation","xbox","chewy","petco"] },
    { key: "entertain", terms: ["netflix","hulu","spotify","youtube","disney","hbo","amc","cinemark","regal","movie","concert","ticket","stubhub","eventbrite","bowling","arcade","topgolf","dave buster","escape room","museum","zoo","aquarium","theater","comedy","bar tab","nightclub","cover charge"] },
    { key: "health",    terms: ["gym","planet fitness","la fitness","equinox","peloton","crunch","doctor","dentist","pharmacy","cvs","walgreens","rite aid","hospital","urgent care","medical","prescription","vitamin","supplement","yoga","pilates","physical therapy"] },
    { key: "personal",  terms: ["haircut","hair salon","barber","nail","spa","massage","skincare","sephora","ulta","cologne","perfume","grooming","kristine","salon","dry clean","laundry"] },
    { key: "cash",      terms: ["atm","cash withdrawal","withdraw","cash back"] },
    { key: "business",  terms: ["business service","fedex","ups","staples","office depot","notion","slack","zoom","adobe","dropbox","canva","squarespace","shopify","quickbooks","mailchimp","aws","google workspace"] },
  ];
  for (const rule of rules) {
    if (rule.terms.some(t => n.includes(t))) return rule.key;
  }
  return "other";
}

const SUPPORTED_BANKS = [
  { key: "chase",        label: "Chase" },
  { key: "amex",         label: "American Express" },
  { key: "wellsfargo",   label: "Wells Fargo" },
  { key: "capitalone",   label: "Capital One" },
  { key: "citi",         label: "Citi" },
  { key: "bankofamerica",label: "Bank of America" },
  { key: "other",        label: "Other / Unknown" },
];

function StatementImporter({ onImport, activeTxnCategories, learnedCats }) {
  const [bank, setBank] = useState("chase");
  const [step, setStep] = useState("upload");
  const [error, setError] = useState("");
  const [parsedGroups, setParsedGroups] = useState({});
  const [checked, setChecked] = useState({});
  const [edits, setEdits] = useState({});
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("ledger_anthropic_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const fileRef = React.useRef();

  const bankLabel = SUPPORTED_BANKS.find(b => b.key === bank)?.label || "your bank";

  function handleSaveKey() {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    localStorage.setItem("ledger_anthropic_key", trimmed);
    setApiKey(trimmed);
    setApiKeyInput("");
    setShowKeyPrompt(false);
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const key = localStorage.getItem("ledger_anthropic_key") || apiKey;
    if (!key) {
      setShowKeyPrompt(true);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError("");
    setStep("parsing");

    try {
      // Convert PDF to base64 directly — no external CDN needed
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const catList = activeTxnCategories.map(c => `${c.key}: ${c.label}`).join(", ");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64Data },
              },
              {
                type: "text",
                text: `You are parsing a ${bankLabel} bank/credit card statement to extract transactions.

Extract every transaction and return ONLY a valid JSON array. No explanation, no markdown, no code fences — just the raw JSON array.

Each item must have exactly these fields:
- "name": merchant/description (clean it up, remove codes/IDs)
- "amount": positive number (dollar amount, no $ sign)
- "date": "YYYY-MM-DD" format
- "catKey": best matching category from this list: ${catList}

Rules:
- Skip payments, credits, balance transfers, fees unless it's clearly a purchase
- If date has no year, assume current year ${CUR_YEAR}
- Amount must always be positive
- Use "other" if no category fits`,
              }
            ]
          }],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`API ${response.status}: ${data.error?.message || JSON.stringify(data)}`);

      const rawText = data.content.find(b => b.type === "text")?.text || "";
      let transactions;
      try {
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        transactions = JSON.parse(cleaned);
        if (!Array.isArray(transactions)) throw new Error("Not an array — got: " + cleaned.slice(0, 200));
      } catch (parseErr) {
        setError("Parse error: " + parseErr.message);
        setStep("upload");
        return;
      }

      const groups = {};
      const initChecked = {};
      const initEdits = {};

      transactions.forEach((t, i) => {
        // Parse as local time to avoid UTC offset shifting the date to previous day
        const parts = t.date ? t.date.split("-") : [];
        const date = parts.length === 3 ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])) : new Date(t.date);
        const yr = isNaN(date) ? CUR_YEAR : date.getFullYear();
        const mo = isNaN(date) ? CUR_MONTH : date.getMonth();
        const groupKey = `${yr}-${mo}`;
        if (!groups[groupKey]) groups[groupKey] = [];
        const id = `import_${Date.now()}_${i}`;
        const cat = activeTxnCategories.find(c => c.key === t.catKey) || activeTxnCategories.find(c => c.key === "other");
        const learned = learnedCats[t.name?.trim().toLowerCase()];
        const finalCatKey = learned || (cat ? cat.key : "other");
        const txn = { id, name: t.name || "Unknown", amount: Math.abs(parseFloat(t.amount) || 0), catKey: finalCatKey, date: t.date, yr, mo };
        groups[groupKey].push(txn);
        initChecked[id] = true;
        initEdits[id] = { name: txn.name, amount: txn.amount, catKey: finalCatKey };
      });

      setParsedGroups(groups);
      setChecked(initChecked);
      setEdits(initEdits);
      setStep("review");

    } catch (err) {
      setError("Something went wrong: " + err.message);
      setStep("upload");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  function toggleAll(groupKey, val) {
    const ids = parsedGroups[groupKey].map(t => t.id);
    setChecked(prev => { const n = {...prev}; ids.forEach(id => n[id] = val); return n; });
  }

  function handleConfirm(allData, setAllData, saveGlobalSubsFn, removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, learnedCats, setLearnedCats) {
    let newLearned = { ...learnedCats };
    setAllData(prev => {
      const next = { ...prev };
      Object.entries(parsedGroups).forEach(([groupKey, txns]) => {
        const [yr, mo] = groupKey.split("-").map(Number);
        const key = `budget_${yr}_${mo}`;
        const current = next[key] || { fixedOverrides: {}, variables: {}, planned: [], customPlanned: [], oneTimeExpenses: [], transactions: [] };
        const newTransactions = [...(current.transactions || [])];
        const newVars = { ...(current.variables || {}) };
        txns.forEach(txn => {
          if (!checked[txn.id]) return;
          const edit = edits[txn.id] || {};
          const finalName = (edit.name || txn.name).trim();
          const finalAmt = parseFloat(edit.amount) || txn.amount;
          const finalCatKey = edit.catKey || txn.catKey;
          const cat = activeTxnCategories.find(c => c.key === finalCatKey);
          const varKey = cat ? cat.varKey : finalCatKey;
          if (finalCatKey !== "other") newLearned[finalName.toLowerCase()] = finalCatKey;
          newTransactions.push({ id: Date.now() + Math.random(), name: finalName, amount: finalAmt, catKey: finalCatKey, varKey, label: cat ? cat.label : finalCatKey, note: "" });
          if (varKey) newVars[varKey] = (newVars[varKey] || 0) + finalAmt;
        });
        next[key] = { ...current, transactions: newTransactions, variables: newVars };
      });
      // saved via localStorage in handleBulkImport
      return next;
    });
    setLearnedCats(newLearned);
    setStep("done");
  }

  const sortedGroupKeys = Object.keys(parsedGroups).sort((a, b) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return ay !== by ? ay - by : am - bm;
  });

  const totalSelected = Object.values(checked).filter(Boolean).length;

  if (step === "done") return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
      <div style={{ fontSize: 14, color: "#4ade80", fontWeight: 700, marginBottom: 8 }}>Import complete!</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>{totalSelected} transactions added to your spending log.</div>
      <button onClick={() => { setStep("upload"); setParsedGroups({}); setChecked({}); setEdits({}); }}
        style={{ fontSize: 12, padding: "8px 20px", borderRadius: 8, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        Import Another
      </button>
    </div>
  );

  return (
    <div>
      {/* API key prompt */}
      {(showKeyPrompt || !apiKey) && (step === "upload" || step === "parsing") && (
        <div style={{ background: "#1a1000", border: "1px solid #f59e0b44", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600, marginBottom: 4 }}>Anthropic API Key Required</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10, lineHeight: 1.6 }}>
            PDF parsing uses the Anthropic API. Your key is stored locally in your browser only — it never leaves your device.
            Get a key at <span style={{ color: T.accent }}>console.anthropic.com</span>.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="password" placeholder="sk-ant-..." value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSaveKey(); }}
              style={{ flex: 1, fontSize: 12, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
            <button onClick={handleSaveKey}
              style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              Save Key
            </button>
          </div>
          {apiKey && (
            <div style={{ fontSize: 10, color: "#4ade80", marginTop: 8 }}>✓ Key saved — you can upload your PDF now.</div>
          )}
        </div>
      )}
      {apiKey && !showKeyPrompt && (step === "upload" || step === "parsing") && (
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>✓ API key saved locally</span>
          <button onClick={() => { localStorage.removeItem("ledger_anthropic_key"); setApiKey(""); setShowKeyPrompt(true); }}
            style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit" }}>
            Change
          </button>
        </div>
      )}
      {(step === "upload" || step === "parsing") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Bank</div>
            <select value={bank} onChange={e => setBank(e.target.value)}
              style={{ fontSize: 13, padding: "8px 12px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit", width: "100%" }}>
              {SUPPORTED_BANKS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Upload Statement (PDF)</div>
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "20px", borderRadius: 10, border: `2px dashed ${T.border2}`,
              cursor: step === "parsing" ? "not-allowed" : "pointer", color: "var(--text-dim)", fontSize: 13,
              background: "var(--bg-input)", transition: "border 0.2s",
            }}>
              {step === "parsing" ? "⏳ Parsing statement..." : "📄 Click to upload PDF"}
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} disabled={step === "parsing"} style={{ display: "none" }} />
            </label>
          </div>
          {error && <div style={{ fontSize: 12, color: "#ef4444", padding: "10px 14px", background: "#2e0f0f", borderRadius: 8, border: "1px solid #ef444433" }}>{error}</div>}
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>Only text-based PDFs are supported. Scanned/image PDFs won't work.</div>
        </div>
      )}

      {step === "review" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text-sec)", marginBottom: 20 }}>
            Review and edit before importing. <span style={{ color: T.accent, fontWeight: 600 }}>{totalSelected} selected</span> across {sortedGroupKeys.length} month{sortedGroupKeys.length !== 1 ? "s" : ""}.
          </div>
          {sortedGroupKeys.map(groupKey => {
            const [yr, mo] = groupKey.split("-").map(Number);
            const txns = parsedGroups[groupKey];
            const allChecked = txns.every(t => checked[t.id]);
            return (
              <div key={groupKey} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", fontWeight: 600 }}>
                    {MONTHS[mo]} {yr} — {txns.length} transaction{txns.length !== 1 ? "s" : ""}
                  </div>
                  <button onClick={() => toggleAll(groupKey, !allChecked)}
                    style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                    {allChecked ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {txns.map(txn => {
                    const edit = edits[txn.id] || {};
                    const isChecked = checked[txn.id];
                    const cat = activeTxnCategories.find(c => c.key === (edit.catKey || txn.catKey));
                    return (
                      <div key={txn.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-card)", borderRadius: 10, border: `1px solid ${isChecked ? T.border : T.border + "44"}`, opacity: isChecked ? 1 : 0.45, transition: "opacity 0.15s" }}>
                        <input type="checkbox" checked={!!isChecked} onChange={e => setChecked(prev => ({ ...prev, [txn.id]: e.target.checked }))}
                          style={{ flexShrink: 0, accentColor: T.accent, width: 15, height: 15 }} />
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: cat ? cat.color : "#64748b", flexShrink: 0 }} />
                        <input type="text" value={edit.name ?? txn.name}
                          onChange={e => setEdits(prev => ({ ...prev, [txn.id]: { ...prev[txn.id], name: e.target.value } }))}
                          style={{ flex: 2, minWidth: 80, fontSize: 12, background: "transparent", border: "none", outline: "none", color: "var(--text-pri)", fontFamily: "inherit" }} />
                        <span style={{ fontSize: 10, color: "var(--text-dim)", flexShrink: 0 }}>{txn.date}</span>
                        <select value={edit.catKey || txn.catKey}
                          onChange={e => setEdits(prev => ({ ...prev, [txn.id]: { ...prev[txn.id], catKey: e.target.value } }))}
                          style={{ fontSize: 10, padding: "2px 6px", background: "var(--bg-input)", border: `1px solid ${T.border}`, borderRadius: 6, color: "var(--text-dim)", fontFamily: "inherit", flexShrink: 0, maxWidth: 120 }}>
                          {activeTxnCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>$</span>
                          <input type="number" value={edit.amount ?? txn.amount}
                            onChange={e => setEdits(prev => ({ ...prev, [txn.id]: { ...prev[txn.id], amount: parseFloat(e.target.value) || 0 } }))}
                            style={{ width: 60, fontSize: 13, fontWeight: 700, background: "transparent", border: "none", outline: "none", color: "var(--text-pri)", fontFamily: "inherit" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setStep("upload"); setParsedGroups({}); setChecked({}); setEdits({}); }}
              style={{ fontSize: 12, padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
              ← Start Over
            </button>
            <button onClick={() => onImport(parsedGroups, checked, edits)}
              disabled={totalSelected === 0}
              style={{ fontSize: 12, padding: "10px 24px", borderRadius: 8, border: `1px solid ${totalSelected > 0 ? "#4ade8066" : T.border}`, background: totalSelected > 0 ? "#0f2e1a" : "transparent", color: totalSelected > 0 ? "#4ade80" : "var(--text-dim)", cursor: totalSelected > 0 ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: 700, flex: 1 }}>
              ✓ Import {totalSelected} Transaction{totalSelected !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const parts = timeStr.split(" ");
  const nums = parts[0];
  const ampm = parts[1] || "";
  const day = now.getDate();
  const monthName = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: T.isLight ? "#0c1929" : "#f8fafc" }}>
        {monthName} <span style={{ color: T.accent }}>{day}</span> {year}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 4 }}>
        <span style={{ color: T.isLight ? "#0c1929" : "#f8fafc" }}>{nums} </span>
        <span style={{ color: T.isLight ? "#0c1929" : "#f8fafc" }}>{ampm}</span>
      </div>
    </div>
  );
}

function HeroHeader({ month, setMonth, year, setYear, setEditingItems, theme, setTheme }) {
  const quotes = [
    { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
    { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
    { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
    { text: "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order.", author: "T.T. Munger" },
    { text: "Wealth is not about having a lot of money; it's about having a lot of options.", author: "Chris Rock" },
    { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { text: "The more you learn, the more you earn.", author: "Warren Buffett" },
    { text: "Don't tell me what you value, show me your budget, and I'll tell you what you value.", author: "Joe Biden" },
    { text: "Rich people have small TVs and big libraries. Poor people have small libraries and big TVs.", author: "Zig Ziglar" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  ];
  const shuffle = (arr, avoidFirst) => {
    const a = [...arr];
    for(let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    if (avoidFirst !== undefined && a[0] === avoidFirst && a.length > 1) { [a[0],a[1]]=[a[1],a[0]]; }
    return a;
  };
  const [quoteOrder, setQuoteOrder] = useState(() => shuffle(quotes.map((_,i) => i)));
  const [quotePos, setQuotePos] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(() => 0);
  const [fade, setFade] = useState(true);



  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuotePos(pos => {
          const next = pos + 1;
          if (next >= quotes.length) {
            const last = quoteOrder[quoteOrder.length - 1];
            const newOrder = shuffle(quotes.map((_,i) => i), last);
            setQuoteOrder(newOrder);
            setQuoteIdx(newOrder[0]);
            return 0;
          }
          setQuoteIdx(quoteOrder[next]);
          return next;
        });
        setFade(true);
      }, 400);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      borderRadius: 16,
      marginBottom: 24,
      overflow: "hidden",
      position: "relative",
      background: T.heroGradient,
      padding: "28px 28px 24px",
      minHeight: 220,
    }}>
      {/* Animated background orbs */}
      <div className="hero-orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <style>{`
        :root {
          --bg-page: ${T.pageBg};
          --bg-card: ${T.cardBg};
          --bg-card2: ${T.cardBg2};
          --bg-input: ${T.inputBg};
          --border: ${T.border};
          --border2: ${T.border2};
          --accent: ${T.accent};
          --accent-dim: ${T.accentDim};
          --text-pri: ${T.textPrimary};
          --text-sec: ${T.textSecondary};
          --text-mute: ${T.textMuted};
          --text-dim: ${T.textDim};
        }
        html, body { margin: 0; padding: 0; background: ${T.pageBg}; }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }
        @keyframes fadeQuote { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .glow-positive { border: 2px solid rgba(74,222,128,0.9); }
        .glow-negative { border: 2px solid rgba(239,68,68,0.9); }
        .hero-orbs { position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; }
        .orb1 { width: 300px; height: 300px; background: radial-gradient(circle, ${T.orb1} 0%, transparent 70%); top: -80px; right: -60px; animation: pulse 8s ease-in-out infinite; }
        .orb2 { width: 200px; height: 200px; background: radial-gradient(circle, ${T.orb2} 0%, transparent 70%); bottom: -40px; left: 40px; animation: pulse 6s ease-in-out infinite reverse; }
        .orb3 { width: 150px; height: 150px; background: radial-gradient(circle, ${T.orb3} 0%, transparent 70%); top: 20px; left: 45%; animation: pulse 10s ease-in-out infinite; }
        select { font-family: inherit; }
        @supports (-webkit-touch-callout: none) {
          input, select, textarea { font-size: 16px !important; }
        }
        *, *::before, *::after { box-sizing: border-box; }
        #root, .outer, .outer * { text-align: left; }
        .outer { max-width: 960px; margin: 0 auto; padding: 20px; overflow-x: hidden; width: 100%; box-sizing: border-box; text-align: left; }
        @media (max-width: 640px) {
          .tab-bar-wrap { width: fit-content !important; overflow: visible !important; flex-wrap: wrap !important; }
          .tab-bar-wrap button { flex: 0 0 auto !important; padding: 8px 12px !important; font-size: 11px !important; white-space: nowrap !important; }
          .pill-bar-wrap { flex-wrap: wrap !important; width: 100% !important; }
          .pill-bar-wrap button { flex: 1 !important; font-size: 9px !important; padding: 5px 0 !important; text-align: center !important; }
        }
        .metric-strip { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; width: 100%; }
        @media(min-width: 540px) { .metric-strip { grid-template-columns: repeat(3, 1fr); } }
        @media(min-width: 600px) { .metric-strip { grid-template-columns: repeat(6, 1fr); } }
        .cat-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media(min-width: 600px)  { .cat-grid { grid-template-columns: 1fr 1fr; } }
        @media(min-width: 1100px) { .cat-grid { grid-template-columns: 1fr 1fr 1fr; } }
        .pill-bar-wrap { display: flex; gap: 0; background: ${T.pillBg}; border-radius: 8px; padding: 3px; border: 1px solid ${T.border}; width: 100%; position: relative; margin-bottom: 24px; }
        .pill-highlight { position: absolute; border-radius: 6px; background: ${T.inputBg}; transition: left 0.2s cubic-bezier(0.4,0,0.2,1), width 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.15s; pointer-events: none; opacity: 0; top: 3px; height: calc(100% - 6px); }
        .tab-bar-wrap { display: flex; gap: 0; background: ${T.tabBg}; border-radius: 10px; padding: 4px; border: 1px solid ${T.border}; width: fit-content; position: relative; }
        .toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ${T.border2}; border-radius: 20px; transition: 0.3s; }
        .toggle-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
        .toggle-switch input:checked + .toggle-slider { background: ${T.accent}; }
        .toggle-switch input:checked + .toggle-slider:before { transform: translateX(16px); }
      `}</style>

      {/* Top row: name + month selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20, position: "relative" }}>
        <div>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontStyle: "normal", fontSize: 32, color: T.accent, marginBottom: 4, textAlign: "left", letterSpacing: "0.02em" }}>
            Ledger
          </div>
<div style={{ textAlign: "left" }}><LiveClock /></div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${T.accent}55`, borderRadius: 8, color: "#f8fafc", padding: "8px 12px", fontSize: 13, fontFamily: "inherit" }}>
            {[2024,2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => { const m = parseInt(e.target.value); setMonth(m); setEditingItems({}); }}
            style={{ background: "rgba(0,0,0,0.45)", border: `1px solid ${T.accent}55`, borderRadius: 8, color: "#f8fafc", padding: "8px 12px", fontSize: 13, fontFamily: "inherit" }}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Quote */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 16,
        minHeight: 90,
        position: "relative",
      }}>
        <div style={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>
          <div style={{ fontSize: 13, color: T.isLight ? "#0c2040" : "#f8fafc", lineHeight: 1.6, fontStyle: "italic", marginBottom: 4, textAlign: "left" }}>
            "{quotes[quoteIdx].text}"
          </div>
          <div style={{ fontSize: 11, color: T.isLight ? "#0c2040" : "#f8fafc", letterSpacing: "0.05em", textAlign: "left" }}>
            — {quotes[quoteIdx].author}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSubRow({ onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billing, setBilling] = useState("monthly");
  const [chargeMonth, setChargeMonth] = useState(0);

  function handleAdd() {
    if (!name.trim() || !amount) return;
    onAdd(name.trim(), amount, billing, chargeMonth);
    setName(""); setAmount(""); setBilling("monthly"); setChargeMonth(0);
  }
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <input type="text" placeholder="New subscription" value={name} onKeyDown={e => { if(e.key==="Enter") handleAdd(); }} onChange={e => setName(e.target.value)}
        style={{ flex: 2, minWidth: 120, fontSize: 12, padding: "5px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
      <input type="number" placeholder={billing === "annual" ? "$/yr" : "$/mo"} value={amount} onFocus={e => e.target.select()} onKeyDown={e => { if(e.key==="Enter") handleAdd(); }} onChange={e => setAmount(e.target.value)}
        style={{ flex: 1, minWidth: 70, fontSize: 12, padding: "5px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
      <select value={billing} onChange={e => setBilling(e.target.value)}
        style={{ fontSize: 11, padding: "5px 6px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-sec)", fontFamily: "inherit" }}>
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
      </select>
      {billing === "annual" && (
        <select value={chargeMonth} onChange={e => setChargeMonth(parseInt(e.target.value))}
          style={{ fontSize: 11, padding: "5px 6px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-sec)", fontFamily: "inherit" }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      )}
      <button onClick={handleAdd}
        style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: "1px solid #06b6d444", background: "#061a1f", color: "#06b6d4", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        + Add
      </button>
    </div>
  );
}

function TransactionForm({ onAdd, categories, learnedCats }) {
  const txnCats = categories || TXN_CATEGORIES;
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [catKey, setCatKey] = useState("other");
  const [note, setNote] = useState("");
  const [autoSet, setAutoSet] = useState(false);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const [date, setDate] = useState(todayStr);

  function handleNameChange(val) {
    setName(val);
    if (val.length > 2) {
      const normalized = val.trim().toLowerCase();
      // Check learned categories first (exact and partial matches)
      const learnedMatch = learnedCats ? Object.keys(learnedCats).find(k => normalized.includes(k) || k.includes(normalized)) : null;
      if (learnedMatch) { setCatKey(learnedCats[learnedMatch]); setAutoSet(true); return; }
      const guess = autoCategory(val);
      if (guess !== "other") { setCatKey(guess); setAutoSet(true); }
      else if (autoSet) { setCatKey("other"); setAutoSet(false); }
    }
  }

  function handleCatClick(key) {
    setCatKey(key);
    setAutoSet(false);
  }

  function handleAdd() {
    if (!name.trim() || !amount) return;
    onAdd(name.trim(), amount, catKey, note.trim(), date);
    setName(""); setAmount(""); setCatKey("other"); setNote(""); setAutoSet(false); setDate(todayStr);
  }

  function handleKey(e) {
    if (e.key === "Enter") handleAdd();
  }

  const selectedCat = txnCats.find(c => c.key === catKey);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text" placeholder="What did you buy?" value={name}
          onChange={e => handleNameChange(e.target.value)} onKeyDown={handleKey}
          style={{ flex: 3, minWidth: 160, fontSize: 14, padding: "8px 12px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 90, background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, paddingLeft: 10 }}>
          <span style={{ fontSize: 14, color: "var(--text-dim)", userSelect: "none" }}>$</span>
          <input
            type="number" placeholder="0.00" value={amount} onFocus={e => e.target.select()} onKeyDown={handleKey}
            onChange={e => setAmount(e.target.value)}
            style={{ flex: 1, fontSize: 14, padding: "8px 8px 8px 4px", background: "transparent", border: "none", outline: "none", color: "var(--text-pri)", fontFamily: "inherit" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {txnCats.map(cat => (
            <button key={cat.key} onClick={() => handleCatClick(cat.key)} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 99,
              border: `1px solid ${catKey === cat.key ? cat.color : T.border2}`,
              background: catKey === cat.key ? `${cat.color}22` : "transparent",
              color: catKey === cat.key ? cat.color : "var(--text-mute)",
              cursor: "pointer", fontFamily: "inherit", fontWeight: catKey === cat.key ? 600 : 400,
              transition: "all 0.15s",
            }}>{cat.label}</button>
          ))}
        </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if(e.key === "Enter") handleAdd(); }}
          style={{ flex: 1, fontSize: 12, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border}`, borderRadius: 6, color: "var(--text-sec)", fontFamily: "inherit", boxSizing: "border-box" }} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ fontSize: 12, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border}`, borderRadius: 6, color: "var(--text-sec)", fontFamily: "inherit", boxSizing: "border-box" }} />
      </div>
      <button onClick={handleAdd} style={{
        fontSize: 13, padding: "10px 20px", borderRadius: 8, width: "100%",
        border: `1px solid ${selectedCat ? selectedCat.color : T.accent}44`,
        background: T.accentDim, color: T.accent,
        cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
      }}>+ Log</button>
    </div>
  );
}

function OneTimeExpenseAdd({ onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  function handleAdd() {
    if (!name.trim() || !amount) return;
    onAdd(name.trim(), parseFloat(amount));
    setName(""); setAmount("");
  }
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <input type="text" placeholder="Name (e.g. Flat Tire Repair)" value={name} onKeyDown={e => { if(e.key==="Enter") handleAdd(); }} onChange={e => setName(e.target.value)}
        style={{ flex: 2, minWidth: 140, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
      <input type="number" placeholder="Amount" value={amount} onFocus={e => e.target.select()} onChange={e => setAmount(e.target.value)} onKeyDown={e => { if(e.key==="Enter") handleAdd(); }}
        style={{ flex: 1, minWidth: 80, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
      <button onClick={handleAdd}
        style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid #f9731644", background: "#1a0f00", color: "#f97316", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
        + Add
      </button>
    </div>
  );
}

function VarCatCard({ cat, items, meta, monthVarMaxes, T }) {
  const [expanded, setExpanded] = useState(false);
  const total = Math.round(items.reduce((s, v) => s + v.value, 0) * 100) / 100;
  const catMax = items.reduce((s, v) => s + (v.max || 0), 0);
  const catPct = catMax > 0 ? total / catMax : 0;
  const isOverBudget = catMax > 0 && total >= catMax;
  const isCatWarn = catMax > 0 && !isOverBudget && catPct >= 0.8;
  const catAlertColor = isOverBudget ? "#dc2626" : isCatWarn ? "#eab308" : meta.color;
  const isMulti = items.length > 1;

  return (
    <div style={{ background: "var(--bg-card)", border: `1px solid ${isOverBudget ? "#dc262666" : isCatWarn ? "#eab30866" : meta.color + "22"}`, borderRadius: 12, padding: "16px 18px", transition: "border 0.3s", cursor: isMulti ? "pointer" : "default" }}
      onClick={() => isMulti && setExpanded(e => !e)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: (!isMulti || expanded) ? 8 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: catAlertColor }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: catAlertColor }}>{meta.label}</span>
          {isMulti && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{expanded ? "▲" : "▼"}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {catMax > 0 && <span style={{ fontSize: 10, color: isOverBudget ? "#dc2626" : isCatWarn ? "#eab308" : "var(--text-dim)" }}>max {fmt(catMax)}</span>}
          <span style={{ fontSize: 14, fontWeight: 700, color: isOverBudget ? "#dc2626" : isCatWarn ? "#eab308" : "var(--text-pri)" }}>{fmt(total)}</span>
        </div>
      </div>
      {(!isMulti || !expanded) && (
        <div style={{ height: 6, background: "var(--bg-input)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${catMax > 0 ? Math.min(total / catMax * 100, 100) : 0}%`, background: catAlertColor, borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      )}
      {isMulti && expanded && (
        <div style={{ borderTop: `1px solid ${meta.color}22`, paddingTop: 12 }} onClick={e => e.stopPropagation()}>
          {items.map(v => {
            const itemPct = v.max ? v.value / v.max : 0;
            const itemOver = v.max && v.value >= v.max;
            const itemWarn = v.max && !itemOver && itemPct >= 0.8;
            const itemColor = itemOver ? "#dc2626" : itemWarn ? "#eab308" : meta.color;
            const isAppliedMax = monthVarMaxes[v.name] !== undefined;
            return (
              <div key={v.name} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: itemOver ? "#dc2626" : itemWarn ? "#eab308" : "var(--text-sec)" }}>{v.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: itemColor }}>{fmt(v.value)}</span>
                    {v.max > 0 && <span style={{ fontSize: 10, color: isAppliedMax ? T.accent : "var(--text-dim)" }}>/ {fmt(v.max)}</span>}
                  </div>
                </div>
                <div style={{ height: 6, background: "var(--bg-input)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${v.max > 0 ? Math.min(v.value / v.max * 100, 100) : 0}%`, background: itemColor, borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IncomeSourceRow({ src, idx, onRename, onUpdateAmount, onToggle, onDelete, onFreqChange }) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(src.name);
  const inputRef = React.useRef();

  function handlePencilClick() {
    setEditing(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  }

  function handleBlur() {
    setEditing(false);
    if (nameVal.trim() && nameVal.trim() !== src.name) onRename(idx, nameVal.trim());
    else setNameVal(src.name);
  }

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${src.enabled !== false ? "#4ade8033" : T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 100, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input ref={inputRef} type="text" value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
              style={{ fontSize: 13, color: "var(--text-pri)", background: "var(--bg-input)", border: `1px solid ${T.accent}66`, borderRadius: 6, outline: "none", fontFamily: "inherit", width: "100%", padding: "2px 6px" }}
            />
          ) : (
            <div style={{ fontSize: 13, color: src.enabled !== false ? "var(--text-pri)" : "var(--text-dim)" }}>{src.name}</div>
          )}
          <div style={{ fontSize: 10, color: "#4ade80" }}>{fmt(monthlyAmount(src))}/mo</div>
        </div>
        <button onClick={handlePencilClick} title="Rename"
          style={{ fontSize: 20, background: "transparent", border: "none", cursor: "pointer", color: editing ? T.accent : "#ffffff", padding: "2px 6px", flexShrink: 0, lineHeight: 1 }}>
          ✎
        </button>
      </div>
      <input key={Math.round(src.amount)} type="number" defaultValue={Math.round(src.amount)}
        onFocus={e => e.target.select()}
        onBlur={e => onUpdateAmount(idx, Math.round(parseFloat(e.target.value) || 0), false)}
        onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
        style={{ width: 76, fontSize: 13, padding: "3px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit", textAlign: "right" }}
      />
      <select value={src.frequency || "monthly"} onChange={e => onFreqChange(idx, e.target.value)}
        style={{ fontSize: 11, padding: "3px 6px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-sec)", fontFamily: "inherit" }}>
        {Object.entries(FREQ_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <label className="toggle-switch">
        <input type="checkbox" checked={src.enabled !== false} onChange={() => onToggle(idx)} />
        <span className="toggle-slider" style={{ background: src.enabled !== false ? "#4ade80" : "#334155" }} />
      </label>
      <button onClick={() => onDelete(src.name)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>x</button>
    </div>
  );
}

function AddIncomeRow({ label, onAdd, showNote }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [freq, setFreq] = useState("monthly");
  function handleAdd() {
    if (!name.trim() || !amount) return;
    onAdd(name.trim(), parseFloat(amount), note.trim(), freq);
    setName(""); setAmount(""); setNote(""); setFreq("monthly");
  }
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "14px 16px", border: `1px dashed ${T.border2}`, textAlign: "left" }}>
      <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "left" }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if(e.key==="Enter") handleAdd(); }}
          style={{ flex: 2, minWidth: 120, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
        <input type="number" placeholder="Amount" value={amount} onFocus={e => e.target.select()} onChange={e => setAmount(e.target.value)} onKeyDown={e => { if(e.key==="Enter") handleAdd(); }}
          style={{ flex: 1, minWidth: 80, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
        {showNote && (
          <select value={freq} onChange={e => setFreq(e.target.value)}
            style={{ fontSize: 12, padding: "6px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-sec)", fontFamily: "inherit" }}>
            {Object.entries(FREQ_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        <button onClick={handleAdd}
          style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
          + Add
        </button>
      </div>
    </div>
  );
}


function SettingsPanel({ allFixedCats, allVarCats, allFixedItems, allVarItems, onAddFixedCat, onAddVarCat, onDeleteFixedCat, onDeleteVarCat, onAddFixedItem, onAddVarItem, onDeleteFixedItem, onDeleteVarItem, deletedFixedCats, deletedVarCats, onRestoreFixedCat, onRestoreVarCat, onPermanentDeleteFixedCat, onPermanentDeleteVarCat, allFixedCatsMeta, allVarCatsMeta, theme, setTheme, fixedCatOrder, setFixedCatOrder, varCatOrder, setVarCatOrder, allFixedCatOrder, allVarCatOrder, onUpdateVarItemMax }) {
  const [newFixedCatLabel, setNewFixedCatLabel] = React.useState("");
  const [newFixedCatColor, setNewFixedCatColor] = React.useState("#3b82f6");
  const [newVarCatLabel, setNewVarCatLabel] = React.useState("");
  const [newVarCatColor, setNewVarCatColor] = React.useState("#22c55e");
  const [newFixedItemName, setNewFixedItemName] = React.useState("");
  const [newFixedItemAmt, setNewFixedItemAmt] = React.useState("");
  const [newFixedItemCat, setNewFixedItemCat] = React.useState("");
  const [newVarItemName, setNewVarItemName] = React.useState("");
  const [newVarItemMax, setNewVarItemMax] = React.useState("");
  const [newVarItemCat, setNewVarItemCat] = React.useState("");
  const [expandedCat, setExpandedCat] = React.useState(null);

  const catColors = ["#f97316","#f43f5e","#10b981","#3b82f6","#8b5cf6","#06b6d4","#f59e0b","#ec4899","#22c55e","#94a3b8"];

  const [dragFixedIdx, setDragFixedIdx] = React.useState(null);
  const [dragVarIdx, setDragVarIdx] = React.useState(null);

  function handleFixedDragStart(idx) { setDragFixedIdx(idx); }
  function handleFixedDragOver(e, idx) {
    e.preventDefault();
    if (dragFixedIdx === null || dragFixedIdx === idx) return;
    const newOrder = [...allFixedCatOrder];
    const [moved] = newOrder.splice(dragFixedIdx, 1);
    newOrder.splice(idx, 0, moved);
    setFixedCatOrder(newOrder);
    setDragFixedIdx(idx);
  }
  function handleVarDragStart(idx) { setDragVarIdx(idx); }
  function handleVarDragOver(e, idx) {
    e.preventDefault();
    if (dragVarIdx === null || dragVarIdx === idx) return;
    const newOrder = [...allVarCatOrder];
    const [moved] = newOrder.splice(dragVarIdx, 1);
    newOrder.splice(idx, 0, moved);
    setVarCatOrder(newOrder);
    setDragVarIdx(idx);
  }

  const sectionStyle = { background: "var(--bg-card)", borderRadius: 12, padding: "20px", border: `1px solid ${T.border}`, marginBottom: 20 };
  const labelStyle = { fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-mute)", marginBottom: 14 };
  const inputStyle = { fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" };
  const btnStyle = { fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 };
  const delBtn = { fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>

      {/* Color Theme */}
      <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "20px", border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 14 }}>Color Theme</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { key: "midnight", label: "Midnight", gradient: "linear-gradient(135deg, #0f0a1e 0%, #1e1b4b 40%, #312e81 60%, #0d0d1a 100%)" },
            { key: "ocean",    label: "Sky",      gradient: "linear-gradient(135deg, #ffffff 0%, #bfdbfe 30%, #7dd3fc 65%, #0284c7 100%)" },
            { key: "ember",    label: "Ember",    gradient: "linear-gradient(135deg, #1c0500 0%, #7c2d12 40%, #431407 70%, #0d0500 100%)" },
            { key: "forest",   label: "Forest",   gradient: "linear-gradient(135deg, #022c0a 0%, #065f1a 40%, #047857 70%, #020b04 100%)" },
          ].map(t => (
            <div key={t.key} onClick={() => setTheme(t.key)}
              style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: theme === t.key ? `2px solid ${T.accent}` : "2px solid transparent", flex: 1, transition: "border 0.2s" }}>
              <div style={{ height: 52, background: t.gradient }} />
              <div style={{ fontSize: 10, textAlign: "center", padding: "5px 0", color: theme === t.key ? T.accent : "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", background: "var(--bg-card)" }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Expense Categories */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Fixed Expense Categories</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {allFixedCatOrder.filter(key => key !== "subscriptions" && allFixedCats[key]).map((key, idx) => {
            const cat = allFixedCats[key];
            return (
            <div key={key} draggable onDragStart={() => handleFixedDragStart(idx)} onDragOver={e => handleFixedDragOver(e, idx)} onDragEnd={() => setDragFixedIdx(null)}
              style={{ opacity: dragFixedIdx === idx ? 0.5 : 1, cursor: "grab" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-page)", borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer" }}
                onClick={() => setExpandedCat(expandedCat === key ? null : key)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--text-dim)", fontSize: 14, cursor: "grab", marginRight: 2, userSelect: "none" }}>⠿</span>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-pri)", fontWeight: 600 }}>{cat.label}</span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{allFixedItems.filter(i => i.cat === key).length} items</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{expandedCat === key ? "▲" : "▼"}</span>
                  <button onClick={e => { e.stopPropagation(); onDeleteFixedCat(key); }} style={delBtn}>✕</button>
                </div>
              </div>
              {expandedCat === key && (
                <div style={{ padding: "10px 14px 4px", background: "var(--bg-card2)", borderRadius: "0 0 8px 8px", border: `1px solid ${T.border}`, borderTop: "none" }}>
                  {allFixedItems.filter(i => i.cat === key).map(item => (
                    <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1e293b11" }}>
                      <span style={{ fontSize: 13, color: "var(--text-sec)" }}>{item.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, color: "var(--text-sec)" }}>${item.amount}/mo</span>
                        <button onClick={() => onDeleteFixedItem(item.originalName || item.name)} style={delBtn}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 6 }}>
                    <input type="text" placeholder="Item name" autoFocus={newFixedItemCat === key} value={newFixedItemCat === key ? newFixedItemName : ""} onFocus={() => setNewFixedItemCat(key)}
                      onChange={e => setNewFixedItemName(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter" && newFixedItemCat===key) { onAddFixedItem(newFixedItemName, newFixedItemAmt, key); setNewFixedItemName(""); setNewFixedItemAmt(""); } }}
                      style={Object.assign({}, inputStyle, { flex: 2 })} />
                    <input type="number" placeholder="$/mo" value={newFixedItemCat === key ? newFixedItemAmt : ""} onFocus={e => { e.target.select(); setNewFixedItemCat(key); }}
                      onChange={e => setNewFixedItemAmt(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter" && newFixedItemCat===key) { onAddFixedItem(newFixedItemName, newFixedItemAmt, key); setNewFixedItemName(""); setNewFixedItemAmt(""); } }}
                      style={Object.assign({}, inputStyle, { width: 80 })} />
                    <button onClick={() => { onAddFixedItem(newFixedItemName, newFixedItemAmt, key); setNewFixedItemName(""); setNewFixedItemAmt(""); }} style={btnStyle}>+ Add</button>
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="New category name" value={newFixedCatLabel} onChange={e => setNewFixedCatLabel(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter") { onAddFixedCat(newFixedCatLabel, newFixedCatColor); setNewFixedCatLabel(""); } }}
            style={Object.assign({}, inputStyle, { flex: 1, minWidth: 140 })} />
          <div style={{ display: "flex", gap: 6 }}>
            {catColors.map(c => (
              <div key={c} onClick={() => setNewFixedCatColor(c)}
                style={{ width: 20, height: 20, borderRadius: "50%", background: c, cursor: "pointer", border: newFixedCatColor === c ? "2px solid #fff" : "2px solid transparent" }} />
            ))}
          </div>
          <button onClick={() => { onAddFixedCat(newFixedCatLabel, newFixedCatColor, key => { setExpandedCat(key); setNewFixedItemCat(key); setNewFixedItemName(""); setNewFixedItemAmt(""); }); setNewFixedCatLabel(""); }} style={btnStyle}>+ Add Category</button>
        </div>
        {deletedFixedCats && deletedFixedCats.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Removed categories — click to restore:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {deletedFixedCats.map(key => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => onRestoreFixedCat(key)}
                    style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit" }}>
                    + {(allFixedCatsMeta[key] && allFixedCatsMeta[key].label) || key}
                  </button>
                  <button onClick={() => onPermanentDeleteFixedCat(key)}
                    style={{ fontSize: 10, padding: "3px 6px", borderRadius: 99, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Variable Expense Categories */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Variable Expense Categories</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {allVarCatOrder.filter(key => allVarCats[key]).map((key, idx) => {
            const cat = allVarCats[key];
            return (
            <div key={key} draggable onDragStart={() => handleVarDragStart(idx)} onDragOver={e => handleVarDragOver(e, idx)} onDragEnd={() => setDragVarIdx(null)}
              style={{ opacity: dragVarIdx === idx ? 0.5 : 1, cursor: "grab" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-page)", borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer" }}
                onClick={() => setExpandedCat(expandedCat === ("var_"+key) ? null : ("var_"+key))}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--text-dim)", fontSize: 14, cursor: "grab", marginRight: 2, userSelect: "none" }}>⠿</span>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-pri)", fontWeight: 600 }}>{cat.label}</span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{allVarItems.filter(i => i.cat === key).length} items</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{expandedCat === ("var_"+key) ? "▲" : "▼"}</span>
                  <button onClick={e => { e.stopPropagation(); onDeleteVarCat(key); }} style={delBtn}>✕</button>
                </div>
              </div>
              {expandedCat === ("var_"+key) && (
                <div style={{ padding: "10px 14px 4px", background: "var(--bg-card2)", borderRadius: "0 0 8px 8px", border: `1px solid ${T.border}`, borderTop: "none" }}>
                  {allVarItems.filter(i => i.cat === key).map(item => (
                    <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1e293b11" }}>
                      <span style={{ fontSize: 13, color: "var(--text-sec)" }}>{item.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>max $</span>
                        <input type="number" defaultValue={item.max || 0} key={`${item.name}_${item.max}`} onFocus={e => e.target.select()}
                          onBlur={e => onUpdateVarItemMax(item.name, e.target.value)}
                          onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                          style={{ width: 60, fontSize: 12, padding: "2px 6px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit", textAlign: "right" }} />
                        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>/mo</span>
                        <button onClick={() => onDeleteVarItem(item.name)} style={delBtn}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 6 }}>
                    <input type="text" placeholder="Item name" autoFocus={newVarItemCat === key} value={newVarItemCat === key ? newVarItemName : ""} onFocus={() => setNewVarItemCat(key)}
                      onChange={e => setNewVarItemName(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter" && newVarItemCat===key) { onAddVarItem(newVarItemName, key, newVarItemMax); setNewVarItemName(""); setNewVarItemMax(""); } }}
                      style={Object.assign({}, inputStyle, { flex: 2 })} />
                    <input type="number" placeholder="Max $/mo" value={newVarItemCat === key ? newVarItemMax : ""} onFocus={e => { e.target.select(); setNewVarItemCat(key); }}
                      onChange={e => setNewVarItemMax(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter" && newVarItemCat===key) { onAddVarItem(newVarItemName, key, newVarItemMax); setNewVarItemName(""); setNewVarItemMax(""); } }}
                      style={Object.assign({}, inputStyle, { width: 90 })} />
                    <button onClick={() => { onAddVarItem(newVarItemName, key, newVarItemMax); setNewVarItemName(""); setNewVarItemMax(""); }} style={btnStyle}>+ Add</button>
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="New category name" value={newVarCatLabel} onChange={e => setNewVarCatLabel(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter") { onAddVarCat(newVarCatLabel, newVarCatColor); setNewVarCatLabel(""); } }}
            style={Object.assign({}, inputStyle, { flex: 1, minWidth: 140 })} />
          <div style={{ display: "flex", gap: 6 }}>
            {catColors.map(c => (
              <div key={c} onClick={() => setNewVarCatColor(c)}
                style={{ width: 20, height: 20, borderRadius: "50%", background: c, cursor: "pointer", border: newVarCatColor === c ? "2px solid #fff" : "2px solid transparent" }} />
            ))}
          </div>
          <button onClick={() => { onAddVarCat(newVarCatLabel, newVarCatColor, key => { setExpandedCat("var_"+key); setNewVarItemCat(key); setNewVarItemName(""); setNewVarItemMax(""); }); setNewVarCatLabel(""); }} style={btnStyle}>+ Add Category</button>
        </div>
        {deletedVarCats && deletedVarCats.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Removed categories — click to restore:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {deletedVarCats.map(key => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => onRestoreVarCat(key)}
                    style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit" }}>
                    + {(allVarCatsMeta[key] && allVarCatsMeta[key].label) || key}
                  </button>
                  <button onClick={() => onPermanentDeleteVarCat(key)}
                    style={{ fontSize: 10, padding: "3px 6px", borderRadius: 99, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function AskLedger({ contextData, apiKeyOverride }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => apiKeyOverride || localStorage.getItem("ledger_anthropic_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const messagesEndRef = React.useRef(null);
  const hasAutoRun = React.useRef(false);

  React.useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function buildSystemPrompt() {
    const d = contextData;
    return `You are a personal finance advisor built into Ledger, a budgeting app. You have access to the user's real financial data for ${d.monthName} ${d.year}. Be concise, specific, and direct. Use dollar amounts from their data. Don't be preachy. Max 4-5 insights or a short focused answer.

THEIR FINANCIAL DATA:
- Monthly Income: $${Math.round(d.totalIncome)} (Recurring: $${Math.round(d.totalRecurring)}, One-time: $${Math.round(d.totalOneTime)})
- Fixed Costs: $${Math.round(d.totalFixed)} (${d.totalIncome > 0 ? Math.round(d.totalFixed / d.totalIncome * 100) : 0}% of income)
- Variable Spending: $${Math.round(d.totalVar)} logged
- Total Out: $${Math.round(d.totalOut)}
- Net: ${d.remaining >= 0 ? "+" : ""}$${Math.round(d.remaining)}
- Variable Budget Max: $${Math.round(d.totalVarMax)} (${d.totalVarMax > 0 ? Math.round(d.totalVar / d.totalVarMax * 100) : 0}% used)

FIXED COSTS BREAKDOWN:
${d.fixedItems.map(i => `- ${i.name}: $${Math.round(i.effectiveAmount)}/mo (${i.cat})`).join("\n")}

VARIABLE SPENDING THIS MONTH:
${d.varItems.filter(v => v.value > 0 || v.max > 0).map(v => `- ${v.name}: $${Math.round(v.value)} spent / $${Math.round(v.max)} max`).join("\n")}

TRANSACTIONS (${d.transactions.length} total):
${d.transactions.slice(-30).map(t => `- ${t.name}: $${Math.round(t.amount)} (${t.label || t.catKey})`).join("\n")}

SAVINGS GOALS:
${d.savingsGoals.length > 0 ? d.savingsGoals.map(g => `- ${g.name}: $${Math.round(g.saved || 0)} saved of $${Math.round(g.target)}${g.deadline ? ` — due ${g.deadline}` : ""}`).join("\n") : "None set"}

PREVIOUS MONTH VARIABLE SPENDING:
${d.prevVarItems ? d.prevVarItems.filter(v => v.prev > 0).map(v => `- ${v.name}: $${Math.round(v.prev)}`).join("\n") : "No previous month data"}`;
  }

  async function runQuery(userMessage, isAuto) {
    const key = apiKeyOverride || localStorage.getItem("ledger_anthropic_key") || apiKey;
    if (!key) { setShowKeyPrompt(true); return; }
    setLoading(true);
    const newMessages = isAuto ? [] : [...messages, { role: "user", content: userMessage }];
    if (!isAuto) setMessages(newMessages);

    const prompt = isAuto
      ? "Analyze my finances for this month. Give me 4-5 specific insights: what's concerning, what's good, what I should watch. Be direct and use my actual numbers."
      : userMessage;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: isAuto
            ? [{ role: "user", content: prompt }]
            : [...newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })), { role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API error");
      const reply = data.content.find(b => b.type === "text")?.text || "";
      setMessages(prev => [...(isAuto ? [] : prev), ...(isAuto ? [{ role: "user", content: "Analyze my finances" }] : []), { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    }
    setLoading(false);
  }

  function handleOpen() {
    setOpen(true);
    if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      runQuery("", true);
    }
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    runQuery(msg, false);
  }

  function handleSaveKey() {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    localStorage.setItem("ledger_anthropic_key", trimmed);
    setApiKey(trimmed);
    setApiKeyInput("");
    setShowKeyPrompt(false);
    if (!hasAutoRun.current) { hasAutoRun.current = true; runQuery("", true); }
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={handleOpen}
        style={{
          position: "fixed", bottom: 28, right: 48, zIndex: 200,
          width: 52, height: 52, borderRadius: "50%",
          background: T.accent, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 20px ${T.accent}66`,
          transition: "transform 0.2s, box-shadow 0.2s",
          fontSize: 22,
        }}
        title="Ask Ledger"
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        💬
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 92, right: 48, zIndex: 200,
          width: 340, maxHeight: 500,
          background: "var(--bg-card)", borderRadius: 16,
          border: `1px solid ${T.accentBorder}`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.4)`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>💬</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.accent }}>Ask Ledger</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>

          {/* API key prompt */}
          {showKeyPrompt && (
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, background: "#1a1000", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginBottom: 6 }}>Anthropic API Key Required</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>Your key is stored locally — never leaves your device. Get one at console.anthropic.com</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="password" placeholder="sk-ant-..." value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveKey(); }}
                  style={{ flex: 1, fontSize: 11, padding: "5px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                <button onClick={handleSaveKey}
                  style={{ fontSize: 10, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && !loading && (
              <div style={{ fontSize: 12, color: "var(--text-dim)", textAlign: "center", paddingTop: 20 }}>Opening your finances...</div>
            )}
            {messages.map((m, i) => (
              m.role === "user" && m.content === "Analyze my finances" ? null :
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
                background: m.role === "user" ? T.accentDim : "var(--bg-page)",
                border: `1px solid ${m.role === "user" ? T.accentBorder : T.border}`,
                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                padding: "8px 12px",
                fontSize: 12,
                color: m.role === "user" ? T.accent : "var(--text-sec)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "var(--bg-page)", border: `1px solid ${T.border}`, borderRadius: "12px 12px 12px 2px", padding: "8px 12px", fontSize: 12, color: "var(--text-dim)" }}>
                Analyzing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              type="text" placeholder="Ask a question..." value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              style={{ flex: 1, fontSize: 12, padding: "7px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit", outline: "none" }}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}
              style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, opacity: loading || !input.trim() ? 0.5 : 1 }}>
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

const LEDGER_STORAGE_KEY = "ledger_budget_data";

export default function App() {
  const userId = null; // no auth in template version
  const userEmail = null;
  const [tab, setTab] = useState(0);
  const [expenseView, setExpenseView] = useState("fixed");
  const [month, setMonth] = useState(CUR_MONTH);
  const [year, setYear] = useState(CUR_YEAR);
  const [allData, setAllData] = useState({});
  const [removedSubs, setRemovedSubs] = useState([]);
  const [globalCustomSubs, setGlobalCustomSubs] = useState([]);
  const [globalSubOverrides, setGlobalSubOverrides] = useState({}); // name -> amount
  const [globalSubNames, setGlobalSubNames] = useState({}); // originalName -> displayName
  const [permanentlyDeleted, setPermanentlyDeleted] = useState([]); // default subs fully removed
  const [billingOverriddenSubs, setBillingOverriddenSubs] = useState([]);
  const [learnedCats, setLearnedCats] = useState({});
  const [varItemMaxOverrides, setVarItemMaxOverrides] = useState({}); // name -> max override for default items // normalized name -> catKey
  const [fixedCatOrder, setFixedCatOrder] = useState([]); // user-defined order
  const [varCatOrder, setVarCatOrder] = useState([]); // user-defined order
  const [retroCharges, setRetroCharges] = useState({}); // { subName: [monthIdx, ...] } // default subs moved to annual
  const [deletedPlanned, setDeletedPlanned] = useState([]); // default planned items fully removed
  const [globalChargeMonths, setGlobalChargeMonths] = useState({}); // name -> chargeMonth
  const [editingItems, setEditingItems] = useState({});
  const [editVals, setEditVals] = useState({});
  const [txnSearch, setTxnSearch] = useState("");
  const [showImporter, setShowImporter] = useState(false);
  const [preAdjustMaxes, setPreAdjustMaxes] = useState(null);
  const preAdjustRef = React.useRef(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [startingBalance, setStartingBalance] = useState(null);
  const [netWorthOverrides, setNetWorthOverrides] = useState({});
  const [appliedVarMaxes, setAppliedVarMaxes] = useState({}); // { month_key: { itemName: max } }
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [showSettings, setShowSettings] = useState(false); // [{ id, name, target, deadline, saved }] // local string buffer while typing
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState("midnight");
  const isMobile = useIsMobile();
  const [needsRecalc, setNeedsRecalc] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemCat, setNewItemCat] = useState("debt");
  const [customFixedCats, setCustomFixedCats] = useState({}); // key -> {label, color}
  const [customVarCats, setCustomVarCats] = useState({});    // key -> {label, color}
  const [customFixedItems, setCustomFixedItems] = useState([]); // {name, amount, cat}
  const [customVarItems, setCustomVarItems] = useState([]);    // {name, cat, max}
  const [deletedFixedItems, setDeletedFixedItems] = useState([]); // default item names removed
  const [deletedVarItems, setDeletedVarItems] = useState([]);    // default var item names removed
  const [deletedFixedCats, setDeletedFixedCats] = useState([]); // default fixed cat keys removed
  const [deletedVarCats, setDeletedVarCats] = useState([]);    // default var cat keys removed
  const [deletedIncomeSources, setDeletedIncomeSources] = useState([]); // default income source names removed
  const [globalIncomeSources, setGlobalIncomeSources] = useState(null); // null = use defaults

  T = THEMES_CONFIG[theme] || THEMES_CONFIG.midnight;
  CURRENT_YEAR = year;
  const monthKey = `budget_${year}_${month}`;

  // Active income sources
  const activeSources = globalIncomeSources !== null ? globalIncomeSources : INCOME_DEFAULTS.filter(s => !deletedIncomeSources.includes(s.name));

  // Merged cats and items (defaults + custom, minus deleted)
  const allFixedCats = Object.fromEntries(Object.entries(Object.assign({}, FIXED_CATS, customFixedCats)).filter(([k]) => !deletedFixedCats.includes(k)));
  const allVarCats = Object.fromEntries(Object.entries(Object.assign({}, VAR_CATS, customVarCats)).filter(([k]) => !deletedVarCats.includes(k)));
  const allFixedItems = [
    ...FIXED_DEFAULTS.filter(i => !deletedFixedItems.includes(i.name)),
    ...customFixedItems,
  ];
  const allVarItems = [
    ...VARIABLE_DEFAULTS.filter(i => !deletedVarItems.includes(i.name)).map(i => varItemMaxOverrides[i.name] !== undefined ? { ...i, max: varItemMaxOverrides[i.name] } : i),
    ...customVarItems.filter(i => i.name && i.name.trim() && !deletedVarCats.includes(i.cat)),
  ];
  const baseFixedOrder = [...FIXED_CAT_ORDER.filter(k => k !== "subscriptions" && allFixedCats[k]), ...Object.keys(customFixedCats)];
  const allFixedCatOrder = fixedCatOrder.length > 0 ? [...fixedCatOrder.filter(k => baseFixedOrder.includes(k)), ...baseFixedOrder.filter(k => !fixedCatOrder.includes(k))] : baseFixedOrder;
  const baseVarOrder = [...VAR_CAT_ORDER.filter(k => allVarCats[k]), ...Object.keys(customVarCats).filter(k => !deletedVarCats.includes(k))];
  const allVarCatOrder = varCatOrder.length > 0 ? [...varCatOrder.filter(k => baseVarOrder.includes(k)), ...baseVarOrder.filter(k => !varCatOrder.includes(k))] : baseVarOrder;
  // Transaction categories - derived from active var items so deletions in Settings reflect here
  const activeVarItemNames = new Set(allVarItems.map(i => i.name));
  const activeTxnCategories = [
    ...TXN_CATEGORIES.filter(c => c.varKey === null || activeVarItemNames.has(c.varKey)),
    ...customVarItems.filter(i => i.name && i.name.trim() && !deletedVarCats.includes(i.cat)).map(i => ({ key: i.name.toLowerCase().replace(/ +/g, "_"), label: i.name, varKey: i.name, color: allVarCats[i.cat] ? allVarCats[i.cat].color : "#64748b" })),
    ...Object.entries(customVarCats).filter(([k]) => !deletedVarCats.includes(k) && k && customVarCats[k]?.label).map(([k, v]) => ({ key: k, label: v.label, varKey: k, color: v.color })),
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAllData(parsed);
        const globalSubs = parsed["budget_subs_global"] || {};
        setRemovedSubs(globalSubs.removedSubs || []);
        setGlobalCustomSubs(globalSubs.customSubs || []);
        setGlobalSubOverrides(globalSubs.subOverrides || {});
        setGlobalChargeMonths(globalSubs.chargeMonths || {});
        setGlobalSubNames(globalSubs.subNames || {});
        setPermanentlyDeleted(globalSubs.permanentlyDeleted || []);
        setBillingOverriddenSubs(globalSubs.billingOverriddenSubs || []);
        setFixedCatOrder(globalSubs.fixedCatOrder || []);
        setVarCatOrder(globalSubs.varCatOrder || []);
        setLearnedCats(globalSubs.learnedCats || {});
        setVarItemMaxOverrides(globalSubs.varItemMaxOverrides || {});
        setSavingsGoals(globalSubs.savingsGoals || []);
        setStartingBalance(globalSubs.startingBalance !== undefined ? globalSubs.startingBalance : null);
        setNetWorthOverrides(globalSubs.netWorthOverrides || {});
        setRetroCharges(globalSubs.retroCharges || {});
        setDeletedPlanned(globalSubs.deletedPlanned || []);
        setCustomFixedCats(globalSubs.customFixedCats || {});
        setCustomVarCats(globalSubs.customVarCats || {});
        setCustomFixedItems(globalSubs.customFixedItems || []);
        setCustomVarItems(globalSubs.customVarItems || []);
        setDeletedFixedItems(globalSubs.deletedFixedItems || []);
        setDeletedVarItems(globalSubs.deletedVarItems || []);
        setDeletedFixedCats(globalSubs.deletedFixedCats || []);
        setDeletedVarCats(globalSubs.deletedVarCats || []);
        setDeletedIncomeSources(globalSubs.deletedIncomeSources || []);
        setGlobalIncomeSources(globalSubs.globalIncomeSources || null);
        if (globalSubs.theme) setTheme(globalSubs.theme);
      }
    } catch(e) { console.error("Load error:", e); }
    setLoaded(true);
    setNeedsRecalc(true);
  }, []);

  useEffect(() => {
    if (loaded && needsRecalc) {
      setNeedsRecalc(false);
      updateMonthData(d => {
        const txns = d.transactions || [];
        if (txns.length === 0) return d;
        const newVars = { ...(d.variables || {}) };
        txns.forEach(txn => {
          const vk = txn.varKey || (TXN_CATEGORIES.find(c => c.key === txn.catKey) || {}).varKey;
          if (vk) newVars[vk] = 0;
        });
        txns.forEach(txn => {
          const vk = txn.varKey || (TXN_CATEGORIES.find(c => c.key === txn.catKey) || {}).varKey;
          if (vk) newVars[vk] = (newVars[vk] || 0) + txn.amount;
        });
        return { ...d, variables: newVars };
      });
    }
  }, [loaded, needsRecalc]);

  const save = useCallback((newData) => {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(newData));
    } catch(e) { console.error("Save error:", e); }
  }, []);

  function saveIncomeSources(newSources) {
    setGlobalIncomeSources(newSources);
    const globalSubs = {
      removedSubs: removedSubs, customSubs: globalCustomSubs,
      subOverrides: globalSubOverrides, chargeMonths: globalChargeMonths,
      subNames: globalSubNames, permanentlyDeleted: permanentlyDeleted,
      deletedPlanned: deletedPlanned,
      customFixedCats: customFixedCats, customVarCats: customVarCats,
      customFixedItems: customFixedItems, customVarItems: customVarItems,
      deletedFixedItems: deletedFixedItems, deletedVarItems: deletedVarItems,
      deletedFixedCats: deletedFixedCats, deletedVarCats: deletedVarCats,
      deletedIncomeSources: deletedIncomeSources,
      globalIncomeSources: newSources,
    };
    const updated = Object.assign({}, allData, { "budget_subs_global": globalSubs });
    setAllData(updated);
    save(updated);
  }

  function saveGlobalSubs(removed, customS, overrides, chargeMonths, opts = {}) {
    const {
      newAll, newPerm, newSubNames, newDelPlanned,
      newRetro, newLearned, newDeletedIncome, newVarMaxOverrides,
      newCustomVarItems, newStartingBalance, newNetWorthOverrides
    } = opts;
    const globalSubs = {
      removedSubs: removed,
      customSubs: customS,
      subOverrides: overrides,
      chargeMonths: chargeMonths,
      subNames: newSubNames !== undefined ? newSubNames : globalSubNames,
      permanentlyDeleted: newPerm !== undefined ? newPerm : permanentlyDeleted,
      billingOverriddenSubs: billingOverriddenSubs,
      deletedPlanned: newDelPlanned !== undefined ? newDelPlanned : deletedPlanned,
      customFixedCats: customFixedCats,
      customVarCats: newCustomVarItems !== undefined ? newCustomVarItems : customVarItems,
      customFixedItems: customFixedItems,
      customVarItems: newCustomVarItems !== undefined ? newCustomVarItems : customVarItems,
      deletedFixedItems: deletedFixedItems,
      deletedVarItems: deletedVarItems,
      deletedFixedCats: deletedFixedCats,
      deletedVarCats: deletedVarCats,
      deletedIncomeSources: deletedIncomeSources,
      globalIncomeSources: globalIncomeSources,
      theme: theme,
      fixedCatOrder: fixedCatOrder,
      varCatOrder: varCatOrder,
      learnedCats: newLearned !== undefined ? newLearned : learnedCats,
      varItemMaxOverrides: newVarMaxOverrides !== undefined ? newVarMaxOverrides : varItemMaxOverrides,
      savingsGoals: savingsGoals,
      retroCharges: newRetro !== undefined ? newRetro : retroCharges,
      startingBalance: newStartingBalance !== undefined ? newStartingBalance : startingBalance,
      netWorthOverrides: newNetWorthOverrides !== undefined ? newNetWorthOverrides : netWorthOverrides,
    };
    if (newAll) {
      const updated = { ...newAll, "budget_subs_global": globalSubs };
      setAllData(updated);
      save(updated);
      return updated;
    } else {
      setAllData(prev => {
        const updated = { ...prev, "budget_subs_global": globalSubs };
        save(updated);
        return updated;
      });
      return null;
    }
  }

  function saveConfig(newFixedCats, newVarCats, newFixedItems, newVarItems, newDelFixed, newDelVar, newDelFixedCats, newDelVarCats, newDelIncome) {
    const fc = newFixedCats !== undefined ? newFixedCats : customFixedCats;
    const vc = newVarCats !== undefined ? newVarCats : customVarCats;
    const fi = newFixedItems !== undefined ? newFixedItems : customFixedItems;
    const vi = newVarItems !== undefined ? newVarItems : customVarItems;
    const df = newDelFixed !== undefined ? newDelFixed : deletedFixedItems;
    const dv = newDelVar !== undefined ? newDelVar : deletedVarItems;
    const di = newDelIncome !== undefined ? newDelIncome : deletedIncomeSources;
    if (newFixedCats !== undefined) setCustomFixedCats(fc);
    if (newVarCats !== undefined) setCustomVarCats(vc);
    if (newFixedItems !== undefined) setCustomFixedItems(fi);
    if (newVarItems !== undefined) setCustomVarItems(vi);
    if (newDelFixed !== undefined) setDeletedFixedItems(df);
    if (newDelVar !== undefined) setDeletedVarItems(dv);
    if (newDelIncome !== undefined) setDeletedIncomeSources(di);
    const globalSubs = {
      removedSubs: removedSubs, customSubs: globalCustomSubs,
      subOverrides: globalSubOverrides, chargeMonths: globalChargeMonths,
      subNames: globalSubNames, permanentlyDeleted: permanentlyDeleted,
      deletedPlanned: deletedPlanned,
      customFixedCats: fc, customVarCats: vc,
      customFixedItems: fi, customVarItems: vi,
      deletedFixedItems: df, deletedVarItems: dv,
      deletedFixedCats: deletedFixedCats, deletedVarCats: deletedVarCats,
      deletedIncomeSources: di,
      globalIncomeSources: globalIncomeSources,
    };
    setAllData(prev => {
      const updated = { ...prev, "budget_subs_global": globalSubs };
      save(updated);
      return updated;
    });
  }

  // --- Settings handlers ---
  function handleUpdateVarItemMax(name, newMax) {
    const isDefault = VARIABLE_DEFAULTS.some(v => v.name === name);
    if (isDefault) {
      const newOverrides = Object.assign({}, varItemMaxOverrides, { [name]: Math.round(parseFloat(newMax) || 0) });
      setVarItemMaxOverrides(newOverrides);
      saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newVarMaxOverrides: newOverrides });
    } else {
      const newCustom = customVarItems.map(v => v.name === name ? { ...v, max: Math.round(parseFloat(newMax) || 0) } : v);
      setCustomVarItems(newCustom);
      saveConfig(undefined, undefined, undefined, newCustom);
    }
  }

  function handleBatchUpdateVarItemMaxes(updates) {
    const defaultUpdates = updates.filter(u => VARIABLE_DEFAULTS.some(v => v.name === u.name));
    const customUpdates = updates.filter(u => !VARIABLE_DEFAULTS.some(v => v.name === u.name));
    let newOverrides = { ...varItemMaxOverrides };
    defaultUpdates.forEach(u => { newOverrides[u.name] = Math.round(u.max); });
    let newCustom = customVarItems.map(v => {
      const upd = customUpdates.find(u => u.name === v.name);
      return upd ? { ...v, max: Math.round(upd.max) } : v;
    });
    if (defaultUpdates.length) {
      setVarItemMaxOverrides(newOverrides);
      saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newVarMaxOverrides: newOverrides });
    }
    if (customUpdates.length) {
      setCustomVarItems(newCustom);
      saveConfig(undefined, undefined, undefined, newCustom);
    }
  }

  function handleAutoAdjust() {
    const disposable = Math.max(0, totalIncome - totalFixed);
    const itemsWithBudget = allVarItemsWithMonthMaxes.filter(v => v.max > 0);
    const currentTotal = itemsWithBudget.reduce((s, v) => s + v.max, 0);
    if (!disposable || !currentTotal) return;
    const snapshot = itemsWithBudget.map(v => ({ name: v.name, max: v.max }));
    preAdjustRef.current = snapshot;
    setPreAdjustMaxes(snapshot);
    const scale = disposable / currentTotal;
    handleBatchUpdateVarItemMaxes(itemsWithBudget.map(v => ({ name: v.name, max: Math.round(v.max * scale) })));
  }

  function handleRevert() {
    const snapshot = preAdjustRef.current;
    if (!snapshot) return;
    handleBatchUpdateVarItemMaxes(snapshot);
    preAdjustRef.current = null;
    setPreAdjustMaxes(null);
  }

  function handleAddFixedCat(label, color, onCreated) {
    if (!label.trim()) return;
    const key = label.trim().toLowerCase().replace(/ +/g, "_") + "_" + Date.now();
    const newCats = Object.assign({}, customFixedCats, { [key]: { label: label.trim(), color: color } });
    setCustomFixedCats(newCats);
    saveConfig(newCats);
    if (onCreated) onCreated(key);
  }

  function handleAddVarCat(label, color, onCreated) {
    if (!label.trim()) return;
    const key = label.trim().toLowerCase().replace(/ +/g, "_") + "_" + Date.now();
    const newCats = Object.assign({}, customVarCats, { [key]: { label: label.trim(), color: color } });
    setCustomVarCats(newCats);
    saveConfig(undefined, newCats);
    if (onCreated) onCreated(key);
  }

  function handleDeleteFixedCat(key) {
    const isDefault = !!FIXED_CATS[key];
    if (isDefault) {
      const newDelItems = [...deletedFixedItems, ...FIXED_DEFAULTS.filter(i => i.cat === key).map(i => i.name)];
      const newDelCats = [...deletedFixedCats, key];
      setDeletedFixedItems(newDelItems);
      setDeletedFixedCats(newDelCats);
      saveConfig(undefined, undefined, undefined, undefined, newDelItems, undefined, newDelCats);
    } else {
      const newCats = Object.assign({}, customFixedCats);
      delete newCats[key];
      const newItems = customFixedItems.filter(i => i.cat !== key);
      setCustomFixedCats(newCats);
      setCustomFixedItems(newItems);
      saveConfig(newCats, undefined, newItems);
    }
  }

  function handleDeleteVarCat(key) {
    const isDefault = !!VAR_CATS[key];
    if (isDefault) {
      const newDelItems = [...deletedVarItems, ...VARIABLE_DEFAULTS.filter(i => i.cat === key).map(i => i.name)];
      const newDelCats = [...deletedVarCats, key];
      setDeletedVarItems(newDelItems);
      setDeletedVarCats(newDelCats);
      saveConfig(undefined, undefined, undefined, undefined, undefined, newDelItems, undefined, newDelCats);
    } else {
      const newCats = Object.assign({}, customVarCats);
      delete newCats[key];
      const newItems = customVarItems.filter(i => i.cat !== key);
      setCustomVarCats(newCats);
      setCustomVarItems(newItems);
      saveConfig(undefined, newCats, undefined, newItems);
    }
  }

  function handleAddFixedItem(name, amount, cat) {
    if (!name.trim() || !cat) return;
    const newItems = [...customFixedItems, { name: name.trim(), amount: parseFloat(amount) || 0, cat: cat }];
    setCustomFixedItems(newItems);
    saveConfig(undefined, undefined, newItems);
  }

  function handleAddVarItem(name, cat, max) {
    if (!name.trim() || !cat) return;
    const newItems = [...customVarItems, { name: name.trim(), cat: cat, max: parseFloat(max) || 500 }];
    setCustomVarItems(newItems);
    saveConfig(undefined, undefined, undefined, newItems);
  }

  function handleDeleteFixedItem(name) {
    const isDefault = FIXED_DEFAULTS.some(i => i.name === name);
    if (isDefault) {
      const newDel = [...deletedFixedItems, name];
      setDeletedFixedItems(newDel);
      saveConfig(undefined, undefined, undefined, undefined, newDel);
    } else {
      const newItems = customFixedItems.filter(i => i.name !== name);
      setCustomFixedItems(newItems);
      saveConfig(undefined, undefined, newItems);
    }
  }

  function handleRestoreFixedItem(name) {
    const newDel = deletedFixedItems.filter(n => n !== name);
    setDeletedFixedItems(newDel);
    saveConfig(undefined, undefined, undefined, undefined, newDel);
  }

  function handleDeleteVarItem(name) {
    const isDefault = VARIABLE_DEFAULTS.some(i => i.name === name);
    if (isDefault) {
      const newDel = [...deletedVarItems, name];
      setDeletedVarItems(newDel);
      saveConfig(undefined, undefined, undefined, undefined, undefined, newDel);
    } else {
      const newItems = customVarItems.filter(i => i.name !== name);
      setCustomVarItems(newItems);
      saveConfig(undefined, undefined, undefined, newItems);
    }
  }

  function handleExport() {
    const globalSubs = {
      removedSubs: removedSubs,
      customSubs: globalCustomSubs,
      subOverrides: globalSubOverrides,
      chargeMonths: globalChargeMonths,
      subNames: globalSubNames,
      permanentlyDeleted: permanentlyDeleted,
      billingOverriddenSubs: billingOverriddenSubs,
      deletedPlanned: deletedPlanned,
      customFixedCats: customFixedCats,
      customVarCats: customVarCats,
      customFixedItems: customFixedItems,
      customVarItems: customVarItems,
      deletedFixedItems: deletedFixedItems,
      deletedVarItems: deletedVarItems,
      deletedFixedCats: deletedFixedCats,
      deletedVarCats: deletedVarCats,
      deletedIncomeSources: deletedIncomeSources,
      globalIncomeSources: globalIncomeSources,
      fixedCatOrder: fixedCatOrder,
      varCatOrder: varCatOrder,
      learnedCats: learnedCats,
      varItemMaxOverrides: varItemMaxOverrides,
      savingsGoals: savingsGoals,
      retroCharges: retroCharges,
      startingBalance: startingBalance,
      netWorthOverrides: netWorthOverrides,
      theme: theme,
    };
    const exportData = Object.assign({}, allData, { "budget_subs_global": globalSubs });
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget_${year}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setAllData(parsed);
        const gs = parsed["budget_subs_global"] || {};
        setRemovedSubs(gs.removedSubs || []);
        setGlobalCustomSubs(gs.customSubs || []);
        setGlobalSubOverrides(gs.subOverrides || {});
        setGlobalChargeMonths(gs.chargeMonths || {});
        setGlobalSubNames(gs.subNames || {});
        setPermanentlyDeleted(gs.permanentlyDeleted || []);
        setBillingOverriddenSubs(gs.billingOverriddenSubs || []);
        setDeletedPlanned(gs.deletedPlanned || []);
        setCustomFixedCats(gs.customFixedCats || {});
        setCustomVarCats(gs.customVarCats || {});
        setCustomFixedItems(gs.customFixedItems || []);
        setCustomVarItems(gs.customVarItems || []);
        setDeletedFixedItems(gs.deletedFixedItems || []);
        setDeletedVarItems(gs.deletedVarItems || []);
        setDeletedFixedCats(gs.deletedFixedCats || []);
        setDeletedVarCats(gs.deletedVarCats || []);
        setDeletedIncomeSources(gs.deletedIncomeSources || []);
        setGlobalIncomeSources(gs.globalIncomeSources || null);
        setFixedCatOrder(gs.fixedCatOrder || []);
        setVarCatOrder(gs.varCatOrder || []);
        setLearnedCats(gs.learnedCats || {});
        setVarItemMaxOverrides(gs.varItemMaxOverrides || {});
        setSavingsGoals(gs.savingsGoals || []);
        setRetroCharges(gs.retroCharges || {});
        setStartingBalance(gs.startingBalance !== undefined ? gs.startingBalance : null);
        setNetWorthOverrides(gs.netWorthOverrides || {});
        if (gs.theme) setTheme(gs.theme);
        save(parsed);
        alert("Data imported successfully!");
      } catch(err) {
        alert("Failed to import — invalid file. Error: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function handleResetAll() {
    if (!window.confirm("Reset ALL data? This cannot be undone.")) return;
    setAllData({});
    setEditingItems({});
    setRemovedSubs([]);
    setGlobalCustomSubs([]);
    setGlobalSubOverrides({});
    setGlobalChargeMonths({});
    setGlobalSubNames({});
    setPermanentlyDeleted([]);
    setBillingOverriddenSubs([]);
    setFixedCatOrder([]);
    setVarCatOrder([]);
    setLearnedCats({});
    setVarItemMaxOverrides({});
    setSavingsGoals([]);
    setRetroCharges({});
    setStartingBalance(null);
    setNetWorthOverrides({});
    setDeletedPlanned([]);
    setTheme("midnight");
    setGlobalIncomeSources(null);
    localStorage.removeItem(LEDGER_STORAGE_KEY);
  }

  function getMonthData() {
    const d = allData[monthKey] || {};
    return {
      fixedOverrides: d.fixedOverrides || {},
      variables: d.variables || {},
      planned: (d.planned !== undefined ? d.planned : PLANNED_DEFAULTS.map(p => ({ ...p }))).filter(p => !deletedPlanned.includes(p.name)),
      customPlanned: d.customPlanned || [],
      income: d.income || null,
      transactions: d.transactions || [],
      oneTimeExpenses: d.oneTimeExpenses || [],
      removedSubs: [],
      customSubs: [],
      chargeMonthOverrides: {},
    };
  }

  function updateMonthData(updater) {
    setAllData(prev => {
      const current = prev[monthKey] || { fixedOverrides: {}, variables: {}, planned: [], customPlanned: [], oneTimeExpenses: [], transactions: [] };
      const updated = updater(current);
      const newAll = { ...prev, [monthKey]: updated };
      save(newAll);
      return newAll;
    });
  }

  const data = getMonthData();
  const monthVarMaxes = (appliedVarMaxes[monthKey] && Object.keys(appliedVarMaxes[monthKey]).length > 0) ? appliedVarMaxes[monthKey] : {};
  const allVarItemsWithMonthMaxes = allVarItems.map(i => monthVarMaxes[i.name] !== undefined ? { ...i, max: monthVarMaxes[i.name] } : i);

  // Income
  const incomeData = data.income || { sources: INCOME_DEFAULTS.map(s => ({ ...s })), oneTime: [] };
  const totalRecurring = activeSources.filter(s => s.enabled !== false).reduce((sum, s) => sum + monthlyAmount(s), 0);
  const totalOneTime = (incomeData.oneTime || []).reduce((sum, s) => sum + s.amount, 0);
  const totalIncome = totalRecurring + totalOneTime;


  const overrides = data.fixedOverrides;
  const variables = data.variables;
  const planned = data.planned;

  const customSubs = globalCustomSubs;
  const chargeMonthOverrides = globalChargeMonths;
  const oneTimeExpenses = data.oneTimeExpenses || [];
  const totalOneTimeExp = oneTimeExpenses.reduce((s, e) => s + e.amount, 0);
  const customPlanned = data.customPlanned;

  function effectiveSubAmount(item, billing, chargeMonth, amt) {
    if (billing === "annual") {
      return chargeMonth === month ? amt : 0;
    }
    return amt;
  }

  const enrichedFixed = [
    ...allFixedItems
      .filter(item => !(item.cat === "subscriptions" && (removedSubs.includes(item.name) || permanentlyDeleted.includes(item.name) || billingOverriddenSubs.includes(item.name) || globalCustomSubs.some(s => s.name === item.name))))
      .map(item => {
        const subAmt = item.cat === "subscriptions" ? globalSubOverrides[item.name] : overrides[item.name];
        const rawAmt = subAmt !== undefined ? subAmt : item.amount;
        const resolvedChargeMonth = chargeMonthOverrides[item.name] !== undefined ? chargeMonthOverrides[item.name] : (item.chargeMonth !== undefined ? item.chargeMonth : 0);
        const effAmt = item.billing === "annual" ? (resolvedChargeMonth === month ? rawAmt : 0) : rawAmt;
        return {
          ...item,
          defaultAmount: item.amount,
          effectiveAmount: effAmt,
          displayAmount: rawAmt,
          isOverridden: overrides[item.name] !== undefined,
          isPlanned: false,
          isCustomSub: false,
          billing: item.billing || "monthly",
          chargeMonth: resolvedChargeMonth,
          displayName: globalSubNames[item.name] || item.name,
        };
      }),
    ...customSubs.filter(s => !removedSubs.includes(s.name)).map(s => {
      const rawAmt = overrides[s.name] !== undefined ? overrides[s.name] : s.amount;
      const effAmt = s.billing === "annual" ? (s.chargeMonth === month ? rawAmt : 0) : rawAmt;
      return {
        name: s.name, amount: s.amount, cat: "subscriptions",
        defaultAmount: s.amount,
        effectiveAmount: effAmt,
        displayAmount: rawAmt,
        isOverridden: overrides[s.name] !== undefined,
        isPlanned: false,
        isCustomSub: true,
        billing: s.billing || "monthly",
        chargeMonth: s.chargeMonth,
      };
    }),
  ];

  const activePlanned = [...planned, ...customPlanned].filter(p => p.enabled).map(p => ({
    name: p.name, amount: p.amount, cat: p.cat,
    defaultAmount: p.amount, effectiveAmount: p.amount,
    isOverridden: false, isPlanned: true,
  }));

  // Retro-charged removed subs for this month
  const retroForMonth = Object.entries(retroCharges).filter(([name, months]) => months.includes(month) && removedSubs.includes(name));
  const retroItems = retroForMonth.map(([name]) => {
    const def = FIXED_DEFAULTS.find(f => f.name === name);
    const amt = globalSubOverrides[name] !== undefined ? globalSubOverrides[name] : (def ? def.amount : 0);
    return { name: name, cat: "subscriptions", amount: amt, effectiveAmount: amt, displayAmount: amt, billing: "monthly", isRetroCharge: true };
  });
  const enrichedFixedWithRetro = [...enrichedFixed, ...retroItems];
  const allFixed = [...enrichedFixedWithRetro, ...activePlanned];
  const fixedGrouped = groupBy(allFixed, "cat");
  const enrichedVar = allVarItemsWithMonthMaxes.map(v => (Object.assign({}, v, { value: variables[v.name] || 0 })));

  // Previous month data for % change
  const prevMonthKey = `budget_${year}_${month - 1}`;
  const prevData = month > 0 ? (allData[prevMonthKey] || null) : null;
  const prevVariables = prevData ? (prevData.variables || {}) : null;
  const varGrouped = groupBy(enrichedVar, "cat");

  const totalFixed = allFixed.reduce((s, i) => s + i.effectiveAmount, 0);
  const totalVar = enrichedVar.reduce((s, v) => s + v.value, 0);
  const totalOut = totalFixed + totalVar;
  const remaining = totalIncome - totalOut;

  // Save net + var/subs into current month data for chart to read
  React.useEffect(() => {
    const key = `budget_${year}_${month}`;
    const d = allData[key];
    if (!d) return;
    const subsTotal = enrichedFixed.filter(i => i.cat === "subscriptions").reduce((s, i) => s + i.effectiveAmount, 0);
    if (d._chartNet !== remaining || d._chartVar !== totalVar || d._chartSubs !== subsTotal) {
      setAllData(prev => {
        const pd = prev[key] || {};
        return { ...prev, [key]: { ...pd, _chartNet: remaining, _chartVar: totalVar, _chartSubs: subsTotal } };
      });
    }
  }, [remaining, totalVar, month, year]);

  // Smart daily budget
  const today = new Date();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() + 1 : daysInMonth;
  const dailyBudget = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;
  const dailyLabel = isCurrentMonth ? `${daysLeft}d left` : `÷${daysInMonth}d`;

  function handleToggleEdit(name, defaultAmt) {
    setEditingItems(e => ({ ...e, [name]: !e[name] }));
  }

  function handleUpdateOverride(name, val) {
    updateMonthData(d => ({ ...d, fixedOverrides: { ...d.fixedOverrides, [name]: val } }));
  }

  function handleUpdateVar(name, val) {
    updateMonthData(d => ({ ...d, variables: { ...d.variables, [name]: val } }));
  }

  function handleUpdateIncome(updater) {
    updateMonthData(d => {
      const current = d.income || { sources: INCOME_DEFAULTS.map(s => ({ ...s })), oneTime: [] };
      return { ...d, income: updater(current) };
    });
  }

  function handleToggleIncomeSource(idx) {
    const newSources = activeSources.map((s, i) => i === idx ? Object.assign({}, s, { enabled: s.enabled === false ? true : false }) : s);
    saveIncomeSources(newSources);
  }

  function handleUpdateIncomeAmount(idx, val, isOneTime) {
    if (isOneTime) {
      handleUpdateIncome(inc => {
        const oneTime = [...(inc.oneTime || [])];
        oneTime[idx] = { ...oneTime[idx], amount: Math.round(val) };
        return { ...inc, oneTime: oneTime };
      });
    } else {
      const newSources = activeSources.map((s, i) => i === idx ? Object.assign({}, s, { amount: val }) : s);
      saveIncomeSources(newSources);
    }
  }

  function handleDeleteDefaultIncomeSource(name) {
    const newSources = activeSources.filter(s => s.name !== name);
    saveIncomeSources(newSources);
    const isDefault = INCOME_DEFAULTS.some(s => s.name === name);
    if (isDefault) {
      const newDel = [...deletedIncomeSources, name];
      setDeletedIncomeSources(newDel);
      saveConfig(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newDel);
    }
  }

  function handleAddOneTime(name, amount) {
    if (!name || !amount) return;
    handleUpdateIncome(inc => ({
      ...inc,
      oneTime: [...(inc.oneTime || []), { name, amount: Math.round(parseFloat(amount) || 0), type: "one-time" }]
    }));
  }

  function handleDeleteOneTime(idx) {
    handleUpdateIncome(inc => {
      const oneTime = [...(inc.oneTime || [])];
      oneTime.splice(idx, 1);
      return { ...inc, oneTime };
    });
  }

  function handleRenameIncomeSource(idx, newName) {
    if (!newName.trim()) return;
    const newSources = activeSources.map((s, i) => i === idx ? Object.assign({}, s, { name: newName.trim() }) : s);
    saveIncomeSources(newSources);
  }

  function handleAddRecurring(name, amount, note, frequency) {
    const newSources = [...activeSources, { name: name, amount: parseFloat(amount) || 0, note: note, frequency: frequency || "monthly", type: "recurring", enabled: true }];
    saveIncomeSources(newSources);
  }

  function handleDeleteRecurring(idx) {
    const newSources = activeSources.filter((_, i) => i !== idx);
    saveIncomeSources(newSources);
  }

  const transactions = data.transactions || [];

  function handleAddTransaction(name, amount, catKey, note, date) {
    if (!name.trim() || !amount) return;
    const cat = activeTxnCategories.find(c => c.key === catKey);
    // Learn this name->category mapping
    const normalizedName = name.trim().toLowerCase();
    if (catKey !== "other" && learnedCats[normalizedName] !== catKey) {
      const newLearned = Object.assign({}, learnedCats, { [normalizedName]: catKey });
      setLearnedCats(newLearned);
      saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newLearned });
    }
    const varKey = cat ? cat.varKey : catKey;
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const txn = { id: Date.now() + Math.random(), name: name.trim(), amount: parseFloat(amount) || 0, catKey, varKey: varKey, label: cat ? cat.label : catKey, note: note || "", date: date || defaultDate };
    updateMonthData(d => {
      const txns = [...(d.transactions || []), txn];
      const newVars = { ...(d.variables || {}) };
      if (varKey) {
        newVars[varKey] = (newVars[varKey] || 0) + txn.amount;
      }
      return { ...d, transactions: txns, variables: newVars };
    });
  }

  function handleBulkImport(parsedGroups, checked, edits) {
    let newLearned = { ...learnedCats };
    setAllData(prev => {
      const next = { ...prev };
      Object.entries(parsedGroups).forEach(([groupKey, txns]) => {
        const [yr, mo] = groupKey.split("-").map(Number);
        const key = `budget_${yr}_${mo}`;
        const current = next[key] || { fixedOverrides: {}, variables: {}, planned: [], customPlanned: [], oneTimeExpenses: [], transactions: [] };
        const newTransactions = [...(current.transactions || [])];
        const newVars = { ...(current.variables || {}) };
        txns.forEach(txn => {
          if (!checked[txn.id]) return;
          const edit = edits[txn.id] || {};
          const finalName = (edit.name || txn.name).trim();
          const finalAmt = parseFloat(edit.amount) || txn.amount;
          const finalCatKey = edit.catKey || txn.catKey;
          const cat = activeTxnCategories.find(c => c.key === finalCatKey);
          const varKey = cat ? cat.varKey : finalCatKey;
          const normalized = finalName.toLowerCase();
          if (finalCatKey !== "other") newLearned[normalized] = finalCatKey;
          newTransactions.push({
            id: Date.now() + Math.random(),
            name: finalName,
            amount: finalAmt,
            catKey: finalCatKey,
            varKey,
            label: cat ? cat.label : finalCatKey,
            note: "",
          });
          if (varKey) newVars[varKey] = (newVars[varKey] || 0) + finalAmt;
        });
        next[key] = { ...current, transactions: newTransactions, variables: newVars };
      });
      // Supabase save handled by save() via setAllData trigger
      return next;
    });
    setLearnedCats(newLearned);
    setShowImporter(false);
  }

  function handleUpdateTransactionCat(id, newCatKey) {
    const cat = activeTxnCategories.find(c => c.key === newCatKey);
    const newVarKey = cat ? cat.varKey : null;
    updateMonthData(d => {
      const oldTxn = (d.transactions || []).find(t => t.id === id);
      if (!oldTxn) return d;
      const newVars = { ...(d.variables || {}) };
      // Remove amount from old varKey
      if (oldTxn.varKey) newVars[oldTxn.varKey] = Math.max(0, (newVars[oldTxn.varKey] || 0) - oldTxn.amount);
      // Add amount to new varKey
      if (newVarKey) newVars[newVarKey] = (newVars[newVarKey] || 0) + oldTxn.amount;
      const txns = (d.transactions || []).map(t => t.id === id ? { ...t, catKey: newCatKey, varKey: newVarKey, label: cat ? cat.label : newCatKey } : t);
      return { ...d, transactions: txns, variables: newVars };
    });
  }

  function handleUpdateTransactionAmount(id, newAmount) {
    const amt = Math.round(parseFloat(newAmount) || 0);
    updateMonthData(d => {
      const oldTxn = (d.transactions || []).find(t => t.id === id);
      const newVars = { ...(d.variables || {}) };
      if (oldTxn && oldTxn.varKey) {
        newVars[oldTxn.varKey] = Math.max(0, (newVars[oldTxn.varKey] || 0) - oldTxn.amount + amt);
      }
      return { ...d, transactions: (d.transactions || []).map(t => t.id === id ? { ...t, amount: amt } : t), variables: newVars };
    });
  }

  function handleUpdateTransactionName(id, name) {
    if (!name.trim()) return;
    updateMonthData(d => ({
      ...d,
      transactions: (d.transactions || []).map(t => t.id === id ? { ...t, name: name.trim() } : t)
    }));
  }

  function handleUpdateTransactionNote(id, note) {
    updateMonthData(d => ({
      ...d,
      transactions: (d.transactions || []).map(t => t.id === id ? { ...t, note: note } : t)
    }));
  }

  function handleUpdateTransactionDate(id, date) {
    updateMonthData(d => ({
      ...d,
      transactions: (d.transactions || []).map(t => t.id === id ? { ...t, date } : t)
    }));
  }

  function handleDuplicateTransaction(txn) {
    const newTxn = { ...txn, id: Date.now() + Math.random() };
    updateMonthData(d => {
      const txns = [...(d.transactions || []), newTxn];
      const newVars = { ...(d.variables || {}) };
      if (newTxn.varKey) newVars[newTxn.varKey] = (newVars[newTxn.varKey] || 0) + newTxn.amount;
      return { ...d, transactions: txns, variables: newVars };
    });
  }

  function handleDeleteTransaction(id) {
    updateMonthData(d => {
      const txn = (d.transactions || []).find(t => t.id === id);
      const txns = (d.transactions || []).filter(t => t.id !== id);
      const newVars = { ...(d.variables || {}) };
      if (txn && txn.varKey) {
        newVars[txn.varKey] = Math.max(0, (newVars[txn.varKey] || 0) - txn.amount);
      } else if (txn && txn.catKey) {
        const cat = TXN_CATEGORIES.find(c => c.key === txn.catKey);
        if (cat && cat.varKey) {
          newVars[cat.varKey] = Math.max(0, (newVars[cat.varKey] || 0) - txn.amount);
        }
      }
      return { ...d, transactions: txns, variables: newVars };
    });
  }

  function recalcVariablesFromTransactions() {
    updateMonthData(d => {
      const newVars = { ...(d.variables || {}) };
      const txns = d.transactions || [];
      // Reset all transaction-linked vars to 0 then re-sum
      txns.forEach(txn => {
        const varKey = txn.varKey || (TXN_CATEGORIES.find(c => c.key === txn.catKey) || {}).varKey;
        if (varKey) newVars[varKey] = 0;
      });
      txns.forEach(txn => {
        const varKey = txn.varKey || (TXN_CATEGORIES.find(c => c.key === txn.catKey) || {}).varKey;
        if (varKey) newVars[varKey] = (newVars[varKey] || 0) + txn.amount;
      });
      return { ...d, variables: newVars };
    });
  }


  function handleToggleRetroCharge(subName, monthIdx) {
    const current = retroCharges[subName] || [];
    const already = current.includes(monthIdx);
    const updated = already ? current.filter(m => m !== monthIdx) : [...current, monthIdx];
    const newRetro = Object.assign({}, retroCharges, { [subName]: updated });
    setRetroCharges(newRetro);
    saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newRetro });
  }

  function handleRemoveSub(name) {
    if (removedSubs.includes(name)) return;
    const newRemoved = [...removedSubs, name];
    setRemovedSubs(newRemoved);
    saveGlobalSubs(newRemoved, globalCustomSubs, globalSubOverrides, globalChargeMonths);
  }

  function handleRestoreSub(name) {
    const newRemoved = removedSubs.filter(n => n !== name);
    setRemovedSubs(newRemoved);
    saveGlobalSubs(newRemoved, globalCustomSubs, globalSubOverrides, globalChargeMonths);
  }

  function handleFullDeleteSub(name) {
    const isDefault = FIXED_DEFAULTS.some(f => f.name === name) && !customFixedItems.some(f => f.name === name);
    const newCustom = globalCustomSubs.filter(s => s.name !== name);
    const newRemoved = removedSubs.filter(n => n !== name);
    const newOverrides = Object.assign({}, globalSubOverrides);
    delete newOverrides[name];
    const newCM = Object.assign({}, globalChargeMonths);
    delete newCM[name];
    const newPerm = isDefault ? [...permanentlyDeleted, name] : permanentlyDeleted;
    setGlobalCustomSubs(newCustom);
    setRemovedSubs(newRemoved);
    setGlobalSubOverrides(newOverrides);
    setGlobalChargeMonths(newCM);
    setPermanentlyDeleted(newPerm);
    saveGlobalSubs(newRemoved, newCustom, newOverrides, newCM, { newPerm });
  }

  function handleToggleBilling(name, currentBilling) {
    const newBilling = currentBilling === "annual" ? "monthly" : "annual";
    const existsAsOverride = globalCustomSubs.some(s => s.name === name && s.isOverride);
    const existsAsCustom = globalCustomSubs.some(s => s.name === name && !s.isOverride);

    if (newBilling === "monthly") {
      if (existsAsOverride) {
        // Default sub back to monthly: remove override, keep current amount as override
        const overrideEntry = globalCustomSubs.find(s => s.name === name && s.isOverride);
        const cleanCustom = globalCustomSubs.filter(s => !(s.name === name && s.isOverride));
        const newBillingOverride = billingOverriddenSubs.filter(n => n !== name);
        const newOverrides = overrideEntry ? Object.assign({}, globalSubOverrides, {[name]: overrideEntry.amount}) : globalSubOverrides;
        if (overrideEntry) setGlobalSubOverrides(newOverrides);
        setGlobalCustomSubs(cleanCustom);
        setBillingOverriddenSubs(newBillingOverride);
        setEditingItems(prev => Object.assign({}, prev, {[name]: true}));
        saveGlobalSubs(removedSubs, cleanCustom, newOverrides, globalChargeMonths);
      } else if (existsAsCustom) {
        // Custom sub back to monthly - restore saved monthly amount
        const newCustom = globalCustomSubs.map(s => s.name === name ? Object.assign({}, s, {billing: "monthly", amount: s.monthlyAmount !== undefined ? s.monthlyAmount : s.amount, monthlyAmount: undefined}) : s);
        setGlobalCustomSubs(newCustom);
        setEditingItems(prev => Object.assign({}, prev, {[name]: true}));
        saveGlobalSubs(removedSubs, newCustom, globalSubOverrides, globalChargeMonths);
      }
    } else {
      if (existsAsCustom) {
        // Custom sub to annual - store current amount as monthlyAmount for restore
        const newCustom = globalCustomSubs.map(s => s.name === name ? Object.assign({}, s, {billing: "annual", chargeMonth: s.chargeMonth || CUR_MONTH, monthlyAmount: s.amount}) : s);
        setGlobalCustomSubs(newCustom);
        saveGlobalSubs(removedSubs, newCustom, globalSubOverrides, globalChargeMonths);
        setEditingItems(prev => Object.assign({}, prev, {[name]: true}));
      } else {
        // Default sub to annual - keep same amount, open edit
        const defaultItem = FIXED_DEFAULTS.find(f => f.name === name);
        const currentAmt = globalSubOverrides[name] !== undefined ? globalSubOverrides[name] : (defaultItem ? defaultItem.amount : 0);
        const newCustom = [...globalCustomSubs, { name: name, amount: currentAmt, billing: "annual", chargeMonth: CUR_MONTH, isOverride: true }];
        const newBillingOverride = [...billingOverriddenSubs, name];
        setGlobalCustomSubs(newCustom);
        setBillingOverriddenSubs(newBillingOverride);
        saveGlobalSubs(removedSubs, newCustom, globalSubOverrides, globalChargeMonths);
        setEditingItems(prev => Object.assign({}, prev, {[name]: true}));
      }
    }
  }

  function handleRenameCustomSub(oldName, newName) {
    if (!newName.trim() || newName === oldName) return;
    const newCustom = globalCustomSubs.map(s => s.name === oldName ? Object.assign({}, s, {name: newName.trim()}) : s);
    setGlobalCustomSubs(newCustom);
    saveGlobalSubs(removedSubs, newCustom, globalSubOverrides, globalChargeMonths);
  }

  function handleRenameDefaultSub(originalName, newName) {
    if (!newName.trim()) return;
    const newNames = Object.assign({}, globalSubNames, {[originalName]: newName.trim()});
    setGlobalSubNames(newNames);
    saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newSubNames: newNames });
  }



  function handleUpdateSubAmount(name, isCustom, val) {
    const amount = parseFloat(val) || 0;
    if (isCustom) {
      const newCustom = globalCustomSubs.map(s => s.name === name ? Object.assign({}, s, {amount: amount}) : s);
      const newOverrides = Object.assign({}, globalSubOverrides);
      delete newOverrides[name];
      setGlobalCustomSubs(newCustom);
      setGlobalSubOverrides(newOverrides);
      saveGlobalSubs(removedSubs, newCustom, newOverrides, globalChargeMonths);
    } else {
      const newOverrides = Object.assign({}, globalSubOverrides, {[name]: amount});
      setGlobalSubOverrides(newOverrides);
      saveGlobalSubs(removedSubs, globalCustomSubs, newOverrides, globalChargeMonths);
    }
  }

  function handleUpdateSubChargeMonth(name, isCustom, newMonth) {
    if (isCustom) {
      const newCustom = globalCustomSubs.map(s => s.name === name ? { ...s, chargeMonth: newMonth } : s);
      setGlobalCustomSubs(newCustom);
      saveGlobalSubs(removedSubs, newCustom, globalSubOverrides, globalChargeMonths);
    } else {
      const newCM = { ...globalChargeMonths, [name]: newMonth };
      setGlobalChargeMonths(newCM);
      saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, newCM);
    }
  }

  function handleAddSub(name, amount, billing, chargeMonth) {
    if (!name.trim() || !amount) return;
    const trimmedName = name.trim();
    // If re-adding a previously permanently deleted default sub, remove from permanentlyDeleted
    const newPerm = permanentlyDeleted.filter(n => n !== trimmedName);
    if (newPerm.length !== permanentlyDeleted.length) setPermanentlyDeleted(newPerm);
    // Also remove from removedSubs if it was there
    const newRemoved = removedSubs.filter(n => n !== trimmedName);
    if (newRemoved.length !== removedSubs.length) setRemovedSubs(newRemoved);
    const newCustom = [...globalCustomSubs.filter(s => s.name !== trimmedName), { name: trimmedName, amount: parseFloat(amount) || 0, billing: billing || "monthly", chargeMonth: chargeMonth || 0 }];
    setGlobalCustomSubs(newCustom);
    saveGlobalSubs(newRemoved, newCustom, globalSubOverrides, globalChargeMonths, { newPerm });
  }



  function handleAddOneTimeExpense(name, amount) {
    if (!name || !amount) return;
    updateMonthData(d => ({
      ...d,
      oneTimeExpenses: [...(d.oneTimeExpenses || []), { name, amount: parseFloat(amount) || 0 }]
    }));
  }

  function handleDeleteOneTimeExpense(idx) {
    updateMonthData(d => {
      const arr = [...(d.oneTimeExpenses || [])];
      arr.splice(idx, 1);
      return { ...d, oneTimeExpenses: arr };
    });
  }

  function handleTogglePlanned(idx, isCustom) {
    updateMonthData(d => {
      if (isCustom) {
        const cp = [...d.customPlanned];
        cp[idx] = { ...cp[idx], enabled: !cp[idx].enabled };
        return { ...d, customPlanned: cp };
      } else {
        const pl = [...d.planned];
        pl[idx] = { ...pl[idx], enabled: !pl[idx].enabled };
        return { ...d, planned: pl };
      }
    });
  }

  function handleAddCustom() {
    if (!newItemName.trim() || !newItemAmount) return;
    updateMonthData(d => ({
      ...d,
      customPlanned: [...(d.customPlanned || []), {
        name: newItemName.trim(),
        amount: parseFloat(newItemAmount),
        cat: newItemCat,
        enabled: true,
      }]
    }));
    setNewItemName("");
    setNewItemAmount("");
  }

  function handleDeletePlanned(name) {
    const newDeleted = [...deletedPlanned, name];
    setDeletedPlanned(newDeleted);
    saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newDelPlanned: newDeleted });
  }

  function handleDeleteCustom(idx) {
    updateMonthData(d => {
      const cp = [...d.customPlanned];
      cp.splice(idx, 1);
      return { ...d, customPlanned: cp };
    });
  }

  if (!loaded) return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", fontFamily: "monospace" }}>
      Loading...
    </div>
  );

  const totalVarMax = enrichedVar.reduce((s, v) => s + (v.max || 0), 0);
  const totalVarSpent = enrichedVar.reduce((s, v) => s + (v.value || 0), 0);
  const varBudgetPct = totalVarMax > 0 ? totalVarSpent / totalVarMax : 0;
  const varBudgetColor = varBudgetPct >= 1 ? "#dc2626" : varBudgetPct >= 0.8 ? "#eab308" : T.accent;
  function getSubCurrentAmount(name, isCustomSub) {
    if (isCustomSub) {
      const s = globalCustomSubs.find(s => s.name === name);
      return s ? s.amount : 0;
    } else {
      if (globalSubOverrides[name] !== undefined) return globalSubOverrides[name];
      const def = FIXED_DEFAULTS.find(f => f.name === name);
      return def ? def.amount : 0;
    }
  }
  const glowClass = remaining >= 0 ? "glow-positive" : "glow-negative";
  return (
    <div className={glowClass} style={{
      minHeight: "100dvh",
      width: "100%",
      background: "var(--bg-page)",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "var(--text-pri)",
      padding: isMobile ? "12px" : "24px",
      transition: "box-shadow 0.5s ease, border 0.5s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Dancing+Script:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        #root, .outer, .outer * { text-align: left; }
        html, body { margin: 0; padding: 0; background: #0d0d1a; height: -webkit-fill-available; overflow-x: hidden; width: 100%; }
        body { min-height: 100dvh; min-height: -webkit-fill-available; overscroll-behavior-x: none; }
        #root { width: 100%; }
        .outer { max-width: 960px; margin: 0 auto; padding: 20px; overflow-x: hidden; width: 100%; box-sizing: border-box; text-align: left; }
        .monthly-chart { display: block; }
        @media (max-width: 640px) {
          .outer { padding: 12px !important; }
          .monthly-chart { display: none !important; }
          .tab-bar-wrap { width: fit-content !important; overflow: visible !important; flex-wrap: wrap !important; }
          .tab-bar-wrap button { flex: 0 0 auto !important; padding: 8px 12px !important; font-size: 11px !important; white-space: nowrap !important; }
          .pill-bar-wrap { flex-wrap: wrap !important; width: 100% !important; }
          .pill-bar-wrap button { flex: 1 !important; font-size: 9px !important; padding: 5px 0 !important; text-align: center !important; }
        }
        @media (max-width: 500px) {
          .top-controls { flex-direction: column; align-items: flex-start !important; }
          .ctrl-btn { font-size: 10px !important; padding: 5px 10px !important; }
        }
        .metric-strip { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; width: 100%; }
        @media(min-width: 540px) { .metric-strip { grid-template-columns: repeat(3, 1fr); } }
        @media(min-width: 600px) { .metric-strip { grid-template-columns: repeat(6, 1fr); } }
        .cat-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media(min-width: 600px)  { .cat-grid { grid-template-columns: 1fr 1fr; } }
        @media(min-width: 1100px) { .cat-grid { grid-template-columns: 1fr 1fr 1fr; } }
        select { font-family: inherit; }
        .glow-positive { border: 2px solid rgba(74,222,128,0.9); }
        .glow-negative { border: 2px solid rgba(239,68,68,0.9); }
        .hero-orbs { position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; }
        .orb1 { width: 300px; height: 300px; background: radial-gradient(circle, ${T.orb1} 0%, transparent 70%); top: -80px; right: -60px; animation: pulse 8s ease-in-out infinite; }
        .orb2 { width: 200px; height: 200px; background: radial-gradient(circle, ${T.orb2} 0%, transparent 70%); bottom: -40px; left: 40px; animation: pulse 6s ease-in-out infinite reverse; }
        .orb3 { width: 150px; height: 150px; background: radial-gradient(circle, ${T.orb3} 0%, transparent 70%); top: 20px; left: 45%; animation: pulse 10s ease-in-out infinite; }
        .pill-bar-wrap { display: flex; gap: 0; background: ${T.pillBg}; border-radius: 8px; padding: 3px; border: 1px solid ${T.border}; width: 100%; position: relative; margin-bottom: 24px; }
        .pill-highlight { position: absolute; border-radius: 6px; background: ${T.inputBg}; transition: left 0.2s cubic-bezier(0.4,0,0.2,1), width 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.15s; pointer-events: none; opacity: 0; top: 3px; height: calc(100% - 6px); }
        .tab-bar-wrap { display: flex; gap: 0; background: ${T.tabBg}; border-radius: 10px; padding: 4px; border: 1px solid ${T.border}; width: fit-content; position: relative; }
        .tab-highlight { position: absolute; border-radius: 7px; background: ${T.inputBg}; transition: left 0.2s cubic-bezier(0.4,0,0.2,1), width 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.15s; pointer-events: none; opacity: 0; top: 4px; height: calc(100% - 8px); }
        input[type=range] { cursor: pointer; -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: var(--border2); outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #ffffff; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #ffffff; cursor: pointer; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .muted { font-weight: 500; }
        .toggle-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ${T.border2}; border-radius: 20px; transition: 0.2s; }
        .toggle-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
        input:checked + .toggle-slider { background: ${T.accent}; }
        input:checked + .toggle-slider:before { transform: translateX(16px); }
      `}</style>

      <div className="outer">
        {/* Hero Header */}
        <HeroHeader month={month} setMonth={setMonth} year={year} setYear={setYear} setEditingItems={setEditingItems} theme={theme} setTheme={setTheme} />

        {/* Tab bar + data controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 24, width: "100%" }}>

          {/* Mobile: dropdown tab selector */}
          {isMobile ? (
            <select
              value={tab}
              onChange={e => setTab(parseInt(e.target.value))}
              style={{
                flex: 1, fontSize: 13, padding: "10px 14px", fontFamily: "inherit", fontWeight: 600,
                background: T.accentDim, border: `1px solid ${T.accentBorder}`,
                borderRadius: 10, color: T.accent, cursor: "pointer", appearance: "none",
                WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a78bfa' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
              }}
            >
              {TABS.map((t, i) => <option key={t} value={i}>{t}</option>)}
            </select>
          ) : (
            /* Desktop: tab bar */
            <div className="tab-bar-wrap"
              onMouseLeave={e => { const hl = e.currentTarget.querySelector(".tab-highlight"); if (hl) hl.style.opacity = "0"; }}
            >
              <div className="tab-highlight" />
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)}
                  onMouseEnter={e => {
                    const hl = e.currentTarget.parentElement.querySelector(".tab-highlight");
                    if (!hl) return;
                    hl.style.opacity = "1";
                    hl.style.left = e.currentTarget.offsetLeft + "px";
                    hl.style.width = e.currentTarget.offsetWidth + "px";
                  }}
                  style={{
                    padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer",
                    fontSize: 12, fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.08em",
                    background: tab === i ? T.accentDim : "transparent",
                    color: tab === i ? T.accent : "var(--text-dim)",
                    transition: "color 0.15s", whiteSpace: "nowrap", position: "relative", zIndex: 1,
                  }}>{t}</button>
              ))}
            </div>
          )}

          {/* Data controls */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowSettings(s => !s)}
              title="Settings"
              style={{
                padding: "7px 10px", borderRadius: 8, border: `1px solid ${showSettings ? T.accentBorder : T.border2}`,
                cursor: "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit",
                background: showSettings ? T.accentDim : "var(--bg-card)",
                color: "#a78bfa",
                transition: "all 0.15s",
              }}>⚙</button>
          </div>

        </div>

        {/* DASHBOARD TAB */}
        {/* Metric strip - large on dashboard, compact on others */}
        <MetricSquares income={totalIncome} totalFixed={totalFixed} totalVar={totalVar} totalOut={totalOut} remaining={remaining} dailyBudget={dailyBudget} dailyLabel={dailyLabel} large={tab === 0} isMobile={isMobile} />
        {tab !== 0 && <div style={{ borderBottom: `1px solid ${T.border}`, marginBottom: 20 }} />}

        {tab === 0 && (
          <div>

            <SpendBar totalFixed={totalFixed} totalOut={totalOut} income={totalIncome} />
            <div className="monthly-chart"><MonthlyChart allData={allData} /></div>
            {activePlanned.length > 0 && (
              <div style={{ background: "#1a1500", border: "1px solid #f59e0b33", borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#f59e0b" }}>✦ Planned items active:</span>
                <span style={{ fontSize: 11, color: "var(--text-sec)" }}>{activePlanned.map(p => p.name).join(", ")}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>+{fmt(activePlanned.reduce((s,p) => s + p.effectiveAmount, 0))}/mo</span>
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                Fixed Costs — {fmt(totalFixed)}/mo
              </div>
              <div className="cat-grid">
                {allFixedCatOrder.filter(c => fixedGrouped[c]).map(cat => (
                  <CatSummaryCard key={cat} cat={cat} items={fixedGrouped[cat]} cats={allFixedCats} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                Variable Spending — {fmt(totalVar)} logged
              </div>
              <div className="cat-grid">
                {allVarCatOrder.filter(c => varGrouped[c] && allVarCats[c]).map(cat => (
                  <VarSummaryCard key={cat} cat={cat} items={varGrouped[cat]} prevVariables={prevVariables} cats={allVarCats} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {tab === 2 && (
          <div>
            {/* Toggle */}
            <div className="pill-bar-wrap"
              style={{ display: "flex", width: "100%" }}
              onMouseLeave={e => { const hl = e.currentTarget.querySelector(".pill-highlight"); if (hl) hl.style.opacity = "0"; }}
            >
              <div className="pill-highlight" />
              {[["fixed","Fixed"],["variable","Variable"],["subs","Subscriptions"],["report","Report"]].map(([v,label]) => (
                <button key={v}
                  onClick={() => setExpenseView(v)}
                  onMouseEnter={e => {
                    const hl = e.currentTarget.parentElement.querySelector(".pill-highlight");
                    if (!hl) return;
                    hl.style.opacity = "1";
                    hl.style.left = e.currentTarget.offsetLeft + "px";
                    hl.style.width = e.currentTarget.offsetWidth + "px";
                  }}
                  style={{
                    flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 11, fontFamily: "inherit", fontWeight: 600, letterSpacing: "0.08em",
                    textTransform: "uppercase", position: "relative", zIndex: 1, textAlign: "center",
                    background: expenseView === v ? T.accentDim : "transparent",
                    color: expenseView === v ? T.accent : "var(--text-dim)",
                    transition: "color 0.15s",
                  }}>{label}</button>
              ))}
            </div>

            {/* REPORT VIEW */}
            {expenseView === "report" && (() => {
              const reportItems = allVarItemsWithMonthMaxes.filter(v => v.max > 0 || (variables && variables[v.name] > 0));
              const totalBudget = reportItems.reduce((s, v) => s + v.max, 0);
              const totalSpent = reportItems.reduce((s, v) => s + (variables ? (variables[v.name] || 0) : 0), 0);
              const totalDiff = totalBudget - totalSpent;
              return (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                    Budget vs Actual — {MONTHS[month]} {year}
                  </div>
                  {reportItems.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text-dim)", padding: "20px 0" }}>No variable budgets set yet. Add budgets in the Variable tab.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {reportItems.map(v => {
                        const spent = variables ? (variables[v.name] || 0) : 0;
                        const max = v.max;
                        const diff = max - spent;
                        const pct = max > 0 ? Math.min((spent / max) * 100, 100) : 0;
                        const overBudget = spent > max && max > 0;
                        const barColor = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#4ade80";
                        const cat = allVarCats[v.cat] || { color: "#64748b" };
                        return (
                          <div key={v.name} style={{ background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${overBudget ? "#ef444433" : T.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: "var(--text-pri)", fontWeight: 600 }}>{v.name}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{fmt(spent)} / {fmt(max)}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: diff >= 0 ? "#4ade80" : "#ef4444" }}>
                                  {diff >= 0 ? "+" : ""}{fmt(diff)}
                                </span>
                              </div>
                            </div>
                            <div style={{ height: 4, background: "var(--bg-page)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 2, transition: "width 0.3s" }} />
                            </div>
                            {max === 0 && spent > 0 && (
                              <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>No budget set — {fmt(spent)} spent</div>
                            )}
                          </div>
                        );
                      })}
                      <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "16px", border: `1px solid ${totalDiff >= 0 ? "#4ade8033" : "#ef444433"}`, marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</span>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{fmt(totalSpent)} / {fmt(totalBudget)}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: totalDiff >= 0 ? "#4ade80" : "#ef4444" }}>
                              {totalDiff >= 0 ? "+" : ""}{fmt(totalDiff)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {expenseView === "fixed" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                Current Fixed — {fmt(enrichedFixed.reduce((s,i) => s + i.effectiveAmount, 0))}/mo
              </div>
              <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 16 }}>
                Click <span style={{ color: T.accent }}>edit</span> to override for this month. Overridden items show in blue with *.
              </div>
              <div className="cat-grid">
                {allFixedCatOrder.filter(c => groupBy(enrichedFixed, "cat")[c] && allFixedCats[c]).map(cat => {
                  const meta = allFixedCats[cat] || { label: cat, color: "var(--text-mute)" };
                  const items = groupBy(enrichedFixed, "cat")[cat];
                  const total = items.reduce((s, i) => s + i.effectiveAmount, 0);
                  return (
                    <div key={cat} style={{ background: "var(--bg-card)", border: `1px solid ${meta.color}22`, borderRadius: 12, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color }} />
                          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: meta.color }}>{meta.label}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-pri)" }}>{fmt(total)}</span>
                      </div>
                      {items.map(item => {
                        const isEditing = editingItems[item.name];
                        const isSub = item.cat === "subscriptions";
                        return (
                          <div key={item.name} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: "var(--text-sec)" }}>
                                  {item.name}
                                </div>
                                {isSub && item.billing === "annual" && (
                                  <div style={{ fontSize: 10, color: item.chargeMonth === month ? "#f59e0b" : "#475569", marginTop: 1 }}>
                                    {item.chargeMonth === month ? `⚡ Charges this month — ${fmt(item.displayAmount)}` : `Annual — charges in ${MONTHS[item.chargeMonth !== undefined ? item.chargeMonth : 0]}`}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                {isEditing ? (
                                  <input type="number" defaultValue={item.displayAmount} autoFocus
                                    onFocus={e => e.target.select()}
                                    onBlur={e => handleUpdateOverride(item.name, parseFloat(e.target.value) || 0)} onChange={e => {}}
                                    onKeyDown={e => { if(e.key === "Enter") { handleUpdateOverride(item.name, parseFloat(e.target.value) || 0); handleToggleEdit(item.name, item.defaultAmount); } }}
                                    style={{ width: 72, fontSize: 13, padding: "2px 6px", background: "var(--bg-input)", border: `1px solid ${T.accent}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                                ) : (
                                  <span style={{ fontSize: 13, fontWeight: 600, color: item.effectiveAmount === 0 ? "#334155" : "#f1f5f9" }}>
                                    {item.effectiveAmount === 0 && item.billing === "annual" ? "—" : fmt(item.effectiveAmount)}
                                  </span>
                                )}
                                <button onClick={() => handleToggleEdit(item.name, item.defaultAmount)}
                                  style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                                  {isEditing ? "save" : "edit"}
                                </button>

                              </div>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Planned section */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f59e0b22" }}>
                ✦ Planned / Upcoming — toggle to preview impact
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {planned.map((item, idx) => (
                  <div key={item.name} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${item.enabled ? "#f59e0b44" : "#1e293b"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={item.enabled} onChange={() => handleTogglePlanned(idx, false)} />
                        <span className="toggle-slider" />
                      </label>
                      <div>
                        <div style={{ fontSize: 13, color: item.enabled ? "#f59e0b" : "#64748b" }}>{item.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{allFixedCats[item.cat] ? allFixedCats[item.cat].label : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: item.enabled ? "#f59e0b" : "#475569" }}>{fmt(item.amount)}/mo</span>
                      <button onClick={() => handleDeletePlanned(item.name)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>x</button>
                    </div>
                  </div>
                ))}
                {customPlanned.map((item, idx) => (
                  <div key={idx} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${item.enabled ? "#f59e0b44" : "#1e293b"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={item.enabled} onChange={() => handleTogglePlanned(idx, true)} />
                        <span className="toggle-slider" />
                      </label>
                      <div>
                        <div style={{ fontSize: 13, color: item.enabled ? "#f59e0b" : "#64748b" }}>{item.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{allFixedCats[item.cat] ? allFixedCats[item.cat].label : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: item.enabled ? "#f59e0b" : "#475569" }}>{fmt(item.amount)}/mo</span>
                      <button onClick={() => handleDeleteCustom(idx)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>x</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "16px 18px", border: `1px dashed ${T.border2}` }}>
                <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "left", width: "100%" }}>Add custom planned item</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input type="text" placeholder="Name" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                    style={{ flex: 2, minWidth: 120, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                  <input type="number" placeholder="$/mo" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)}
                    style={{ flex: 1, minWidth: 80, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                  <select value={newItemCat} onChange={e => setNewItemCat(e.target.value)}
                    style={{ flex: 1, minWidth: 100, fontSize: 13, padding: "6px 10px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)" }}>
                    {Object.entries(allFixedCats).filter(([k]) => k !== "subscriptions").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={handleAddCustom} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid #f59e0b44", background: "#1a1500", color: "#f59e0b", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

            {expenseView === "variable" && (
          <div>
            {/* Disposable income + adjust buttons */}
            {(() => {
              const disposable = Math.max(0, totalIncome - totalFixed);
              const itemsWithBudget = allVarItemsWithMonthMaxes.filter(v => v.max > 0);
              const totalAllocated = itemsWithBudget.reduce((s, v) => s + v.max, 0);
              const unallocated = disposable - totalAllocated;
              return (
                <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${unallocated < 0 ? "#eab30844" : T.border}`, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 2 }}>Disposable Income</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-pri)" }}>{fmt(disposable)}<span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 6 }}>after fixed costs</span></div>
                    {itemsWithBudget.length > 0 && (
                      <div style={{ fontSize: 11, marginTop: 4, color: unallocated < 0 ? "#eab308" : "#4ade80", fontWeight: 600 }}>
                        {unallocated < 0 ? `⚠ Over budget by ${fmt(Math.abs(unallocated))}` : `${fmt(unallocated)} unallocated`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {itemsWithBudget.length > 0 && (
                      <button onClick={preAdjustMaxes ? handleRevert : handleAutoAdjust}
                        style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: `1px solid ${preAdjustMaxes ? "#f59e0b44" : "#4ade8044"}`, background: preAdjustMaxes ? "#1a1000" : "#0f2e1a", color: preAdjustMaxes ? "#f59e0b" : "#4ade80", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.2s" }}>
                        {preAdjustMaxes ? "↩ Revert" : "↕ Adjust to net"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            {prevVariables && month > 0 && (() => {
              const prevTotals = allVarItems.map(v => ({ name: v.name, prev: prevVariables[v.name] || 0 }));
              const hasPrevData = prevTotals.some(v => v.prev > 0);
              if (!hasPrevData) return null;
              const isApplied = appliedVarMaxes[monthKey] && Object.keys(appliedVarMaxes[monthKey] || {}).length > 0;
              return (
                <div style={{ background: isApplied ? T.accentDim : "var(--bg-card)", border: `1px solid ${isApplied ? T.accentBorder : T.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isApplied ? T.accent : "var(--text-sec)", marginBottom: 2 }}>{isApplied ? "✓ Using " + MONTHS[month - 1] + " actuals as maxes" : "💡 Last month's actuals available"}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{isApplied ? "Maxes are temporarily set from last month's spend." : "Use " + MONTHS[month - 1] + "'s spend as this month's budget maxes?"}</div>
                  </div>
                  {isApplied ? (
                    <button onClick={() => setAppliedVarMaxes(prev => Object.assign({}, prev, { [monthKey]: {} }))}
                      style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-sec)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      Reset maxes
                    </button>
                  ) : (
                    <button onClick={() => {
                      const newMonthMaxes = {};
                      allVarItems.forEach(v => {
                        newMonthMaxes[v.name] = Math.round(prevVariables[v.name] || 0);
                      });
                      setAppliedVarMaxes(prev => Object.assign({}, prev, { [monthKey]: newMonthMaxes }));
                    }}
                      style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      Apply {MONTHS[month - 1]} maxes
                    </button>
                  )}
                </div>
              );
            })()}
            {totalVarMax > 0 && (
              <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${varBudgetPct >= 1 ? "#dc262633" : varBudgetPct >= 0.8 ? "#eab30833" : T.border}`, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 4 }}>Variable Budget</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: varBudgetColor }}>{fmt(totalVarSpent)}</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>/ {fmt(totalVarMax)}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: varBudgetColor }}>{Math.round(varBudgetPct * 100)}%</div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{fmt(totalVarMax - totalVarSpent)} left</div>

                </div>
              </div>
            )}

            <div className="cat-grid">
              {allVarCatOrder.filter(c => varGrouped[c] && allVarCats[c]).map(cat => {
                const meta = allVarCats[cat] || { label: cat, color: "var(--text-mute)" };
                const items = varGrouped[cat];
                return <VarCatCard key={cat} cat={cat} items={items} meta={meta} monthVarMaxes={monthVarMaxes} T={T} />;
              })}
            </div>


          </div>
            )}
            {expenseView === "subs" && (() => {
              const subItems = groupBy(enrichedFixed, "cat")["subscriptions"] || [];
              const annualItems = subItems.filter(i => i.billing === "annual").sort((a,b) => b.displayAmount - a.displayAmount);
              const monthlyItems = subItems.filter(i => i.billing !== "annual").sort((a,b) => getSubCurrentAmount(b.name, b.isCustomSub) - getSubCurrentAmount(a.name, a.isCustomSub));
              const monthlyTotal = monthlyItems.reduce((s, i) => s + getSubCurrentAmount(i.name, i.isCustomSub), 0);
              const subTotal = monthlyTotal + annualItems.reduce((s, i) => s + (i.chargeMonth === month ? i.displayAmount : 0), 0);
              return (
                <div>
                  {/* Summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24, textAlign: "left" }}>
                    {[
                      { label: "This Month", value: fmt(subTotal), color: "#06b6d4" },
                      { label: "Monthly Subs", value: fmt(monthlyTotal), color: "var(--text-pri)" },
                      { label: "Active Monthly", value: `${monthlyItems.length} active`, color: "#3b82f6" },
                      { label: "Annual Subs", value: `${annualItems.length} active`, color: "#f59e0b" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 6, textAlign: "left" }}>{m.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: m.color, textAlign: "left" }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Monthly subs */}
                  {monthlyItems.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#06b6d4", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #06b6d422" }}>
                        Monthly
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {monthlyItems.map(item => {
                          const isEditing = editingItems[item.name];
                          return (
                            <div key={item.name} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                                {isEditing ? (
                                  <React.Fragment key="frag">
                                    <input type="number" value={editVals[item.name] !== undefined ? editVals[item.name] : String(getSubCurrentAmount(item.name, item.isCustomSub))} autoFocus
                                      onFocus={e => { const cur = String(getSubCurrentAmount(item.name, item.isCustomSub)); setEditVals(prev => Object.assign({}, prev, {[item.name]: cur})); e.target.select(); }}
                                      onChange={e => setEditVals(prev => Object.assign({}, prev, {[item.name]: e.target.value}))}
                                      onKeyDown={e => { if(e.key === "Enter") { handleUpdateSubAmount(item.name, item.isCustomSub, editVals[item.name] !== undefined ? editVals[item.name] : String(getSubCurrentAmount(item.name, item.isCustomSub))); handleToggleEdit(item.name, item.defaultAmount); } }}
                                      style={{ width: 68, fontSize: 13, padding: "2px 6px", background: "var(--bg-input)", border: `1px solid ${T.accent}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                                    <input type="text" defaultValue={item.displayName || item.name}
                                        onBlur={e => {
                                          if (item.isCustomSub) { handleRenameCustomSub(item.name, e.target.value); }
                                          else { handleRenameDefaultSub(item.name, e.target.value); }
                                        }}
                                        onKeyDown={e => { if(e.key === "Enter") { if (item.isCustomSub) { handleRenameCustomSub(item.name, e.target.value); } else { handleRenameDefaultSub(item.name, e.target.value); } handleToggleEdit(item.name, item.defaultAmount); } }}
                                        style={{ flex: 1, fontSize: 13, padding: "2px 6px", background: "var(--bg-input)", border: `1px solid ${T.accent}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment key="frag">
                                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-pri)", minWidth: 36 }}>{fmt(getSubCurrentAmount(item.name, item.isCustomSub))}</span>
                                    <span style={{ fontSize: 13, color: "var(--text-sec)" }}>{item.displayName || item.name}</span>
                                  </React.Fragment>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {!isEditing && (
                                  <button onClick={() => handleToggleBilling(item.name, item.billing)}
                                    style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                                    to {item.billing === "annual" ? "monthly" : "annual"}
                                  </button>
                                )}
                                <button onMouseDown={e => { e.preventDefault(); if (isEditing) { handleUpdateSubAmount(item.name, item.isCustomSub, editVals[item.name] !== undefined ? editVals[item.name] : String(getSubCurrentAmount(item.name, item.isCustomSub))); handleToggleEdit(item.name, item.defaultAmount); } else { handleToggleEdit(item.name, item.defaultAmount); } }}
                                  style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                                  {isEditing ? "save" : "edit"}
                                </button>
                                <button onClick={() => handleRemoveSub(item.name)}
                                  style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>x</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Annual subs */}
                  {annualItems.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f59e0b22" }}>
                        Annual
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {annualItems.map(item => {
                          const isEditing = editingItems[item.name];
                          const isChargeMonth = item.chargeMonth === month;
                          return (
                            <div key={item.name} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${isChargeMonth ? "#f59e0b44" : "#1e293b"}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {isEditing ? (
                                  <input type="number" defaultValue={item.displayAmount} autoFocus
                                    onFocus={e => e.target.select()}
                                    onBlur={e => handleUpdateOverride(item.name, parseFloat(e.target.value) || 0)} onChange={e => {}}
                                    onKeyDown={e => { if(e.key === "Enter") { handleUpdateOverride(item.name, parseFloat(e.target.value) || 0); handleToggleEdit(item.name, item.defaultAmount); } }}
                                    style={{ width: 72, fontSize: 13, padding: "2px 6px", background: "var(--bg-input)", border: `1px solid ${T.accent}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                                ) : (
                                  <span style={{ fontSize: 14, fontWeight: 700, color: isChargeMonth ? "#f59e0b" : "#475569", minWidth: 40 }}>
                                    {isChargeMonth ? fmt(item.displayAmount) : "—"}
                                  </span>
                                )}
                                <div>
                                  <div style={{ fontSize: 13, color: "var(--text-pri)" }}>{item.name}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 10, color: isChargeMonth ? "#f59e0b" : "#475569" }}>
                                      {isChargeMonth ? "⚡ Charges this month —" : "Charges in"}
                                    </span>
                                    <select
                                      value={item.chargeMonth !== undefined ? item.chargeMonth : 0}
                                      onChange={e => handleUpdateSubChargeMonth(item.name, item.isCustomSub, parseInt(e.target.value))}
                                      style={{ fontSize: 10, padding: "1px 4px", background: "var(--bg-input)", border: `1px solid ${isChargeMonth ? "#f59e0b44" : "#334155"}`, borderRadius: 4, color: isChargeMonth ? "#f59e0b" : "#64748b", fontFamily: "inherit", cursor: "pointer" }}
                                    >
                                      {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                    <span style={{ fontSize: 10, color: "var(--text-dim)" }}>— {fmt(item.displayAmount)}/yr</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {item.isCustomSub && !isEditing && (
                                  <button onClick={() => handleToggleBilling(item.name, item.billing)}
                                    style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                                    to monthly
                                  </button>
                                )}
                                <button onMouseDown={e => { e.preventDefault(); if (isEditing) { handleUpdateSubAmount(item.name, item.isCustomSub, editVals[item.name] !== undefined ? editVals[item.name] : String(getSubCurrentAmount(item.name, item.isCustomSub))); handleToggleEdit(item.name, item.defaultAmount); } else { handleToggleEdit(item.name, item.defaultAmount); } }}
                                  style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                                  {isEditing ? "save" : "edit"}
                                </button>
                                <button onClick={() => handleRemoveSub(item.name)}
                                  style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Restore removed */}
                  {removedSubs.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.08em" }}>Removed — restore or charge to {MONTHS[month]}:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {removedSubs.filter(name => !permanentlyDeleted.includes(name)).map(name => {
                          const charged = (retroCharges[name] || []).includes(month);
                          return (
                            <div key={name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <button onClick={() => handleRestoreSub(name)}
                                style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit" }}>
                                + {name}
                              </button>
                              <button onClick={() => handleToggleRetroCharge(name, month)}
                                style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, border: `1px solid ${charged ? T.accent : T.border2}`, background: charged ? T.accentDim : "transparent", color: charged ? T.accent : "var(--text-dim)", cursor: "pointer", fontFamily: "inherit" }}>
                                {charged ? "✓ charged" : "+ this month"}
                              </button>
                              <button onClick={() => handleFullDeleteSub(name)}
                                style={{ fontSize: 10, padding: "3px 6px", borderRadius: 99, border: "1px solid #ef444422", background: "transparent", color: "#ef444488", cursor: "pointer", fontFamily: "inherit" }}>
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add new */}
                  <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "16px 18px", border: `1px dashed ${T.border2}` }}>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Add subscription</div>
                    <AddSubRow onAdd={handleAddSub} />
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* INCOME TAB */}
        {tab === 1 && (
          <div>
            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24, textAlign: "left" }}>
              {[
                { label: "Recurring", value: fmt(totalRecurring), color: "#4ade80" },
                { label: "One-Time", value: fmt(totalOneTime), color: "#3b82f6" },
                { label: "Total Income", value: fmt(totalIncome), color: "var(--text-pri)" },
              ].map(m => (
                <div key={m.label} style={{ background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${T.border}`, textAlign: "left" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Recurring sources */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.accent}22` }}>
                Recurring Income
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {activeSources.map((src, idx) => (
                  <IncomeSourceRow key={idx} src={src} idx={idx}
                    onRename={handleRenameIncomeSource}
                    onUpdateAmount={handleUpdateIncomeAmount}
                    onToggle={handleToggleIncomeSource}
                    onDelete={handleDeleteDefaultIncomeSource}
                    onFreqChange={(i, freq) => { const newSources = activeSources.map((s, j) => j === i ? Object.assign({}, s, { frequency: freq }) : s); saveIncomeSources(newSources); }}
                  />
                ))}
              </div>
              {/* Add recurring */}
              <AddIncomeRow label="Add recurring source" onAdd={(name, amount, note, freq) => handleAddRecurring(name, amount, note, freq)} showNote={true} />
            </div>

            {/* One-time income */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.accent}22` }}>
                One-Time Income — this month
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {(incomeData.oneTime || []).map((src, idx) => (
                  <div key={idx} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${T.accent}33`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--text-pri)" }}>{src.name}</div>
                    <input
                      key={Math.round(src.amount)}
                      type="number" defaultValue={Math.round(src.amount)}
                      onFocus={e => e.target.select()}
                      onBlur={e => handleUpdateIncomeAmount(idx, Math.round(parseFloat(e.target.value) || 0), true)}
                      onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                      style={{ width: 80, fontSize: 13, padding: "3px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit", textAlign: "right" }}
                    />
                    <button onClick={() => handleDeleteOneTime(idx)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>x</button>
                  </div>
                ))}
              </div>
              <AddIncomeRow label="Add one-time income" onAdd={(name, amount, _note, _freq) => handleAddOneTime(name, amount)} showNote={false} />
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {/* Settings overlay */}
        {showSettings && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, overflowY: "auto", padding: "40px 20px" }}
            onClick={e => { if (e.target === e.currentTarget) setShowSettings(false); }}>
            <div style={{ maxWidth: 700, margin: "0 auto", background: "var(--bg-page)", borderRadius: 16, padding: "24px", border: `1px solid ${T.border}`, position: "relative" }}>
              {/* Row 1: title + close */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-pri)" }}>Settings</div>
                <button onClick={() => setShowSettings(false)} style={{ fontSize: 18, background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>✕</button>
              </div>
              {/* Row 2: export / import pills */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button onClick={handleExport}
                  style={{ fontSize: 11, padding: "4px 14px", borderRadius: 20, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  ↓ Export
                </button>
                <label style={{ fontSize: 11, padding: "4px 14px", borderRadius: 20, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, display: "inline-flex", alignItems: "center", lineHeight: "normal" }}>
                  ↑ Import
                  <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
                </label>
              </div>
              <SettingsPanel
                allFixedCats={allFixedCats} allVarCats={allVarCats}
                allFixedItems={allFixedItems.filter(i => i.cat !== "subscriptions").map(i => ({
                  name: globalSubNames[i.name] || i.name,
                  originalName: i.name,
                  amount: data.fixedOverrides[i.name] !== undefined ? data.fixedOverrides[i.name] : i.amount,
                  cat: i.cat,
                }))}
                allVarItems={allVarItems}
                onAddFixedCat={handleAddFixedCat} onAddVarCat={handleAddVarCat}
                onDeleteFixedCat={handleDeleteFixedCat} onDeleteVarCat={handleDeleteVarCat}
                onAddFixedItem={handleAddFixedItem} onAddVarItem={handleAddVarItem}
                onDeleteFixedItem={handleDeleteFixedItem} onDeleteVarItem={handleDeleteVarItem}
                deletedFixedCats={deletedFixedCats}
                deletedVarCats={deletedVarCats}
                allFixedCatsMeta={FIXED_CATS}
                allVarCatsMeta={VAR_CATS}
                onRestoreFixedCat={key => { const nd = deletedFixedCats.filter(k => k !== key); const ni = deletedFixedItems.filter(n => !FIXED_DEFAULTS.filter(f => f.cat === key).map(f => f.name).includes(n)); setDeletedFixedCats(nd); setDeletedFixedItems(ni); saveConfig(undefined, undefined, undefined, undefined, ni, undefined, nd); }}
                theme={theme} setTheme={setTheme}
                fixedCatOrder={fixedCatOrder} setFixedCatOrder={setFixedCatOrder}
                varCatOrder={varCatOrder} setVarCatOrder={setVarCatOrder}
                allFixedCatOrder={allFixedCatOrder} allVarCatOrder={allVarCatOrder}
                onUpdateVarItemMax={handleUpdateVarItemMax}
                onRestoreVarCat={key => { const nd = deletedVarCats.filter(k => k !== key); const ni = deletedVarItems.filter(n => !VARIABLE_DEFAULTS.filter(v => v.cat === key).map(v => v.name).includes(n)); setDeletedVarCats(nd); setDeletedVarItems(ni); saveConfig(undefined, undefined, undefined, undefined, undefined, ni, undefined, nd); recalcVariablesFromTransactions(); }}
            onPermanentDeleteFixedCat={key => { const nd = deletedFixedCats.filter(k => k !== key); const newCustom = Object.fromEntries(Object.entries(customFixedCats).filter(([k]) => k !== key)); setDeletedFixedCats(nd); setCustomFixedCats(newCustom); saveConfig(newCustom, undefined, undefined, undefined, undefined, undefined, nd); }}
            onPermanentDeleteVarCat={key => { const nd = deletedVarCats.filter(k => k !== key); const newCustom = Object.fromEntries(Object.entries(customVarCats).filter(([k]) => k !== key)); setDeletedVarCats(nd); setCustomVarCats(newCustom); saveConfig(undefined, newCustom, undefined, undefined, undefined, undefined, undefined, nd); }}
              />
            </div>
          </div>
        )}

        {tab === 4 && (() => {
          const totalSaved = savingsGoals.reduce((s, g) => s + (g.saved || 0), 0);
          const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
          return (
          <div>
            {/* Summary */}
            {savingsGoals.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24, textAlign: "left" }}>
                {[
                  { label: "Total Saved", value: fmt(totalSaved), color: "#4ade80" },
                  { label: "Total Goals", value: fmt(totalTarget), color: "var(--text-pri)" },
                  { label: "Overall", value: totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) + "%" : "0%", color: totalSaved >= totalTarget ? "#4ade80" : T.accent },
                ].map(m => (
                  <div key={m.label} style={{ background: "var(--bg-card)", borderRadius: 12, padding: "14px 16px", border: `1px solid ${T.border}`, textAlign: "left" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Goals list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {savingsGoals.map((goal, idx) => {
                const pct = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
                const deadline = goal.deadline ? new Date(goal.deadline) : null;
                const today = new Date();
                const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - today) / 86400000)) : null;
                const goalColor = pct >= 1 ? "#4ade80" : pct >= 0.8 ? T.accent : "var(--text-pri)";
                return (
                  <div key={goal.id} style={{ background: "var(--bg-card)", borderRadius: 12, padding: "18px 20px", border: `1px solid ${pct >= 1 ? "#4ade8044" : T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-pri)", marginBottom: 2 }}>{goal.name}</div>
                        {deadline && <div style={{ fontSize: 10, color: daysLeft === 0 ? "#ef4444" : "var(--text-dim)" }}>{daysLeft === 0 ? "Due today!" : `${daysLeft} days left — ${deadline.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: goalColor }}>{fmt(goal.saved || 0)}</div>
                        <div style={{ fontSize: 10, color: "var(--text-dim)" }}>of {fmt(goal.target)}</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: "var(--bg-input)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                      <div style={{ width: `${pct * 100}%`, height: "100%", background: pct >= 1 ? "#4ade80" : T.accent, borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                    {/* Saved input + delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Saved so far: $</span>
                      <input type="number" defaultValue={goal.saved || 0} onFocus={e => e.target.select()}
                        key={goal.saved}
                        onBlur={e => {
                          const newGoals = savingsGoals.map((g, i) => i === idx ? { ...g, saved: Math.round(parseFloat(e.target.value) || 0) } : g);
                          setSavingsGoals(newGoals);
                          saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths);
                        }}
                        onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                        style={{ width: 80, fontSize: 12, padding: "3px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit" }} />
                      <div style={{ flex: 1 }} />
                      <button onClick={() => { const newGoals = savingsGoals.filter((_, i) => i !== idx); setSavingsGoals(newGoals); saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths); }}
                        style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add goal */}
            <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "18px 20px", border: `1px dashed ${T.border2}` }}>
              <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Add Savings Goal</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input type="text" placeholder="Goal name (e.g. Costa Rica Trip)" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} onKeyDown={e => { if(e.key === "Enter") { if (!newGoalName.trim() || !newGoalTarget) return; const ng = [...savingsGoals, { id: Date.now() + Math.random(), name: newGoalName.trim(), target: Math.round(parseFloat(newGoalTarget) || 0), deadline: newGoalDeadline || null, saved: 0 }]; setSavingsGoals(ng); saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths); setNewGoalName(""); setNewGoalTarget(""); setNewGoalDeadline(""); } }}
                  style={{ flex: 2, minWidth: 160, fontSize: 13, padding: "8px 12px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit" }} />
                <input type="number" placeholder="Target $" value={newGoalTarget} onFocus={e => e.target.select()} onChange={e => setNewGoalTarget(e.target.value)}
                  style={{ flex: 1, minWidth: 100, fontSize: 13, padding: "8px 12px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit" }} />
                <select value={newGoalDeadline ? newGoalDeadline.split("-")[1] : ""} onChange={e => { const mo = e.target.value; const yr = newGoalDeadline ? newGoalDeadline.split("-")[0] : String(CUR_YEAR); setNewGoalDeadline(mo ? yr + "-" + mo : ""); }}
                  style={{ flex: 1, minWidth: 110, fontSize: 13, padding: "8px 12px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit" }}>
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
                </select>
                <select value={newGoalDeadline ? newGoalDeadline.split("-")[0] : ""} onChange={e => { const yr = e.target.value; const mo = newGoalDeadline ? newGoalDeadline.split("-")[1] : ""; setNewGoalDeadline(yr && mo ? yr + "-" + mo : ""); }}
                  style={{ minWidth: 80, fontSize: 13, padding: "8px 12px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit" }}>
                  <option value="">Year</option>
                  {[CUR_YEAR, CUR_YEAR + 1, CUR_YEAR + 2, CUR_YEAR + 3].map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <button onClick={() => { if (!newGoalName.trim() || !newGoalTarget) return; const ng = [...savingsGoals, { id: Date.now() + Math.random(), name: newGoalName.trim(), target: Math.round(parseFloat(newGoalTarget) || 0), deadline: newGoalDeadline || null, saved: 0 }]; setSavingsGoals(ng); saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths); setNewGoalName(""); setNewGoalTarget(""); setNewGoalDeadline(""); }}
                  style={{ fontSize: 13, padding: "8px 20px", borderRadius: 8, border: `1px solid ${T.accentBorder}`, background: T.accentDim, color: T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>+ Add Goal</button>
              </div>
            </div>
          </div>
          );
        })()}

        {tab === 3 && (
          <div>
            {/* Add transaction form */}
            <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "18px 20px", border: `1px solid ${T.border}`, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase" }}>Log Transaction</div>
                <button onClick={() => setShowImporter(s => !s)}
                  style={{ fontSize: 11, padding: "5px 14px", borderRadius: 8, border: `1px solid ${showImporter ? "#4ade8066" : T.accentBorder}`, background: showImporter ? "#0f2e1a" : T.accentDim, color: showImporter ? "#4ade80" : T.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  {showImporter ? "✕ Close" : "📄 Import Statement"}
                </button>
              </div>
              {showImporter ? (
                <StatementImporter
                  onImport={handleBulkImport}
                  activeTxnCategories={activeTxnCategories}
                  learnedCats={learnedCats}
                />
              ) : (
                <TransactionForm onAdd={handleAddTransaction} categories={activeTxnCategories} learnedCats={learnedCats} />
              )}
            </div>

            {/* Search */}
            {transactions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <input type="text" placeholder="Search by name or category..." value={txnSearch}
                  onChange={e => setTxnSearch(e.target.value)}
                  style={{ width: "100%", fontSize: 13, padding: "8px 12px", background: "var(--bg-card)", border: `1px solid ${T.border}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            )}

            {/* Summary by category */}
            {transactions.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24, textAlign: "left" }}>
                {activeTxnCategories.filter(c => transactions.some(t => t.catKey === c.key)).map(cat => {
                  const total = transactions.filter(t => t.catKey === cat.key).reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={cat.key} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${cat.color}22` }}>
                      <div style={{ fontSize: 10, color: cat.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{cat.label}</div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-pri)" }}>{fmt(total)}</span>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Transaction list */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                {transactions.length} Transaction{transactions.length !== 1 ? "s" : ""} — {MONTHS[month]} {year}
              </div>
              {transactions.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "left", padding: "20px 0" }}>No transactions logged yet this month.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...transactions].sort((a, b) => {
                    const da = a.date || "0000-00-00";
                    const db = b.date || "0000-00-00";
                    return db < da ? -1 : db > da ? 1 : 0;
                  }).filter(txn => { if (!txnSearch) return true; const q = txnSearch.toLowerCase(); const cat = activeTxnCategories.find(c => c.key === txn.catKey); return txn.name.toLowerCase().includes(q) || (cat && cat.label.toLowerCase().includes(q)); }).map(txn => {
                    const cat = activeTxnCategories.find(c => c.key === txn.catKey);
                    return (
                      <div key={txn.id} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: (cat ? cat.color : "#64748b"), flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <input type="text" defaultValue={txn.name}
                              onBlur={e => handleUpdateTransactionName(txn.id, e.target.value)}
                              onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                              style={{ fontSize: 13, color: "var(--text-pri)", background: "transparent", border: "none", outline: "none", padding: 0, fontFamily: "inherit", fontWeight: "inherit", width: "100%", cursor: "text" }} />
                            <input type="text" defaultValue={txn.note || ""} placeholder="add note..."
                              onBlur={e => handleUpdateTransactionNote(txn.id, e.target.value)}
                              onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                              style={{ fontSize: 10, color: "var(--text-dim)", fontStyle: "italic", background: "transparent", border: "none", outline: "none", padding: 0, fontFamily: "inherit", width: "100%", cursor: "text" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                              <select value={txn.catKey} onChange={e => handleUpdateTransactionCat(txn.id, e.target.value)}
                                style={{ fontSize: 10, padding: "1px 4px", background: "var(--bg-input)", border: `1px solid ${T.border}`, borderRadius: 4, color: "var(--text-dim)", fontFamily: "inherit", maxWidth: 140 }}>
                                {activeTxnCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                              </select>
                              <input type="date" defaultValue={txn.date || ""}
                                onBlur={e => handleUpdateTransactionDate(txn.id, e.target.value)}
                                onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                                style={{ fontSize: 10, padding: "1px 4px", background: "var(--bg-input)", border: `1px solid ${T.border}`, borderRadius: 4, color: "var(--text-dim)", fontFamily: "inherit" }} />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-pri)" }}>$</span>
                            <input type="number" defaultValue={Math.round(txn.amount)} key={Math.round(txn.amount)}
                              onFocus={e => e.target.select()}
                              onBlur={e => handleUpdateTransactionAmount(txn.id, e.target.value)}
                              onKeyDown={e => { if(e.key === "Enter") e.target.blur(); }}
                              style={{ fontSize: 14, fontWeight: 700, color: "var(--text-pri)", background: "transparent", border: "none", outline: "none", padding: 0, fontFamily: "inherit", width: 55, textAlign: "left", cursor: "text" }} />
                          </div>
                          <button onClick={() => handleDuplicateTransaction(txn)}
                            style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}
                            title="Duplicate">
                            ⧉
                          </button>
                          <button onClick={() => handleDeleteTransaction(txn.id)}
                            style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, border: `1px solid ${T.border2}`, background: "transparent", color: "var(--text-mute)", cursor: "pointer", fontFamily: "inherit" }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Repeat charges warning */}
              {transactions.length > 0 && (() => {
                const nameCounts = {};
                transactions.forEach(t => {
                  const key = t.name.trim().toLowerCase();
                  nameCounts[key] = (nameCounts[key] || { name: t.name, count: 0, total: 0, catKey: t.catKey });
                  nameCounts[key].count++;
                  nameCounts[key].total += t.amount;
                });
                const repeats = Object.values(nameCounts).filter(r => r.count >= 2).sort((a, b) => b.count - a.count);
                if (repeats.length === 0) return null;
                return (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#eab308", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #eab30822" }}>
                      ⚠ Repeat Charges
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {repeats.map(r => {
                        const cat = TXN_CATEGORIES.find(c => c.key === r.catKey);
                        return (
                          <div key={r.name} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "10px 14px", border: "1px solid #eab30833", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: cat ? cat.color : "#64748b", flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: 13, color: "var(--text-pri)" }}>{r.name}</div>
                                <div style={{ fontSize: 10, color: "#eab308" }}>{r.count}x this month</div>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-pri)" }}>{fmt(r.total)}</div>
                              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{fmt(r.total / r.count)} avg</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {tab === 5 && (() => {
          const NW_YEAR = CUR_YEAR;
          const MLABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const balanceRows = [];
          let runningBalance = startingBalance !== null ? startingBalance : null;
          for (let m = 0; m <= CUR_MONTH; m++) {
            const key = `budget_${NW_YEAR}_${m}`;
            const d = allData[key];
            const net = d && d._chartNet !== undefined ? d._chartNet : null;
            const overrideKey = `${NW_YEAR}_${m}`;
            const hasOverride = netWorthOverrides[overrideKey] !== undefined;
            const balance = hasOverride
              ? netWorthOverrides[overrideKey]
              : runningBalance !== null && net !== null
                ? runningBalance + net
                : null;
            if (balance !== null) runningBalance = balance;
            balanceRows.push({ month: m, label: MLABELS[m], net, balance, hasOverride, overrideKey });
          }
          const validRows = balanceRows.filter(r => r.balance !== null);
          const currentBalance = validRows.length > 0 ? validRows[validRows.length - 1].balance : null;
          const chartPoints = validRows;
          const W = 600, H = 160, PAD = { top: 20, right: 20, bottom: 30, left: 70 };
          const innerW = W - PAD.left - PAD.right;
          const innerH = H - PAD.top - PAD.bottom;
          const vals = chartPoints.map(p => p.balance);
          const minVal = Math.min(...vals);
          const maxVal = Math.max(...vals);
          const range = maxVal - minVal || 1;
          const toX = i => PAD.left + (chartPoints.length > 1 ? (i / (chartPoints.length - 1)) * innerW : innerW / 2);
          const toY = v => PAD.top + innerH - ((v - minVal) / range) * innerH;

          function saveStartingBalance(val) {
            const parsed = parseFloat(val);
            if (isNaN(parsed)) return;
            setStartingBalance(parsed);
            saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newStartingBalance: parsed, newNetWorthOverrides: netWorthOverrides });
          }
          function saveOverride(overrideKey, val) {
            const parsed = parseFloat(val);
            if (isNaN(parsed)) return;
            const newOverrides = { ...netWorthOverrides, [overrideKey]: parsed };
            setNetWorthOverrides(newOverrides);
            saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newNetWorthOverrides: newOverrides });
          }
          function clearOverride(overrideKey) {
            const newOverrides = { ...netWorthOverrides };
            delete newOverrides[overrideKey];
            setNetWorthOverrides(newOverrides);
            saveGlobalSubs(removedSubs, globalCustomSubs, globalSubOverrides, globalChargeMonths, { newNetWorthOverrides: newOverrides });
          }

          return (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
                <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "18px 20px", border: `1px solid ${currentBalance !== null && currentBalance >= 0 ? "#4ade8033" : "#ef444433"}` }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 6 }}>Current Balance</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: currentBalance !== null ? (currentBalance >= 0 ? "#4ade80" : "#ef4444") : "var(--text-dim)", letterSpacing: "-0.02em" }}>
                    {currentBalance !== null ? fmt(currentBalance) : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>{MONTHS[CUR_MONTH]} {NW_YEAR}</div>
                </div>
                <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "18px 20px", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 8 }}>Starting Balance</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    <span style={{ fontSize: 14, color: "var(--text-dim)", flexShrink: 0 }}>$</span>
                    <input type="number" placeholder="0"
                      defaultValue={startingBalance !== null ? Math.round(startingBalance) : ""}
                      key={startingBalance}
                      onFocus={e => e.target.select()}
                      onBlur={e => saveStartingBalance(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                      style={{ flex: 1, minWidth: 0, width: "100%", boxSizing: "border-box", fontSize: 16, fontWeight: 700, padding: "4px 8px", background: "var(--bg-input)", border: `1px solid ${T.border2}`, borderRadius: 8, color: "var(--text-pri)", fontFamily: "inherit" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6 }}>Set once — carried forward each month</div>
                </div>
              </div>

              {chartPoints.length >= 2 && (
                <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "16px 20px", border: `1px solid ${T.border}`, marginBottom: 24 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 12 }}>Balance Trend — {NW_YEAR}</div>
                  <div style={{ overflowX: "auto" }}>
                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 300, display: "block" }}>
                      <defs>
                        <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const y = PAD.top + innerH * t;
                        const v = maxVal - t * range;
                        return (
                          <g key={t}>
                            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1e293b" strokeWidth="1" />
                            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#475569">
                              {Math.abs(v) >= 1000 ? `$${Math.round(v/1000*10)/10}k` : `$${Math.round(v)}`}
                            </text>
                          </g>
                        );
                      })}
                      <path
                        d={`${chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.balance)}`).join(" ")} L ${toX(chartPoints.length-1)} ${PAD.top + innerH} L ${toX(0)} ${PAD.top + innerH} Z`}
                        fill="url(#balanceGrad)" opacity="0.8"
                      />
                      <path
                        d={chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.balance)}`).join(" ")}
                        fill="none" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                      />
                      {chartPoints.map((p, i) => (
                        <g key={i}>
                          <circle cx={toX(i)} cy={toY(p.balance)} r="4" fill={p.hasOverride ? T.accent : "#4ade80"} stroke="#0d0d1a" strokeWidth="1.5" />
                          <text x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#64748b">{p.label}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 8 }}>
                    <span style={{ color: T.accent }}>●</span> overridden &nbsp; <span style={{ color: "#4ade80" }}>●</span> calculated
                  </div>
                </div>
              )}

              {startingBalance !== null && (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                    Monthly Breakdown — {NW_YEAR}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {balanceRows.map(row => (
                      <div key={row.month} style={{ background: "var(--bg-card)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${row.hasOverride ? T.accentBorder : T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 60 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: row.hasOverride ? T.accent : "var(--text-pri)" }}>{row.label}</div>
                          {row.hasOverride && <div style={{ fontSize: 9, color: T.accent, letterSpacing: "0.08em" }}>overridden</div>}
                        </div>
                        <div style={{ fontSize: 11, color: row.net !== null ? (row.net >= 0 ? "#4ade80" : "#ef4444") : "var(--text-dim)", minWidth: 70, textAlign: "center" }}>
                          {row.net !== null ? `${row.net >= 0 ? "+" : ""}${fmt(row.net)} net` : "no data"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: row.balance !== null ? (row.balance >= 0 ? "#4ade80" : "#ef4444") : "var(--text-dim)" }}>
                            {row.balance !== null ? fmt(row.balance) : "—"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>$</span>
                            <input type="number" placeholder="override"
                              defaultValue={row.hasOverride ? Math.round(netWorthOverrides[row.overrideKey]) : ""}
                              key={row.hasOverride ? netWorthOverrides[row.overrideKey] : "empty"}
                              onFocus={e => e.target.select()}
                              onBlur={e => { if (e.target.value.trim()) { saveOverride(row.overrideKey, e.target.value); } }}
                              onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                              style={{ width: 80, fontSize: 12, padding: "3px 6px", background: "var(--bg-input)", border: `1px solid ${row.hasOverride ? T.accentBorder : T.border2}`, borderRadius: 6, color: "var(--text-pri)", fontFamily: "inherit", boxSizing: "border-box" }}
                            />
                            {row.hasOverride && (
                              <button onClick={() => clearOverride(row.overrideKey)}
                                style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid #ef444433", background: "transparent", color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 12 }}>
                    Enter a balance override for any month to correct drift. Clears with ✕.
                  </div>
                </div>
              )}

              {startingBalance === null && (
                <div style={{ fontSize: 13, color: "var(--text-dim)", padding: "20px 0" }}>
                  Set your starting balance above to begin tracking your cash balance over time.
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ fontSize: 10, color: "var(--text-dim)", textAlign: "left", paddingTop: 20 }}>
          * overridden · ✦ planned · data saves automatically · <span style={{ color: T.accentText, opacity: 0.5 }}>v2.8.5</span>
        </div>
      </div>

      <AskLedger
        apiKeyOverride={null}
        contextData={{
          monthName: MONTHS[month], year,
          totalIncome, totalRecurring, totalOneTime,
          totalFixed, totalVar, totalOut, remaining,
          totalVarMax: enrichedVar.reduce((s, v) => s + (v.max || 0), 0),
          fixedItems: allFixed,
          varItems: enrichedVar,
          transactions,
          savingsGoals,
          prevVarItems: prevVariables ? allVarItems.map(v => ({ name: v.name, prev: prevVariables[v.name] || 0 })) : null,
        }}
      />
    </div>
  );
}
