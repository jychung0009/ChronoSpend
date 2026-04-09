import { useState } from "react";
import { getEventsForDate, toKey } from "../utils/dateHelpers";

// ── Category palette (mirrors ExpensesPage) ────────────────────────────────
const CAT_COLORS = {
  food:          "#E65100",
  transport:     "#1565C0",
  entertainment: "#6A1B9A",
  shopping:      "#2E7D32",
  bills:         "#616161",
  health:        "#AD1457",
  education:     "#283593",
  travel:        "#006064",
  other:         "#6B6780",
};

const INCOME_CAT_COLORS = {
  salary:     "#2E7D32",
  freelance:  "#006064",
  gift:       "#F57F17",
  investment: "#283593",
  refund:     "#6A1B9A",
  other:      "#6B6780",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatFullDate(d) {
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function relativeDate(dateStr) {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  if (dateStr === todayKey) return "Today";
  const tom = new Date(today); tom.setDate(tom.getDate() + 1);
  const tomKey = `${tom.getFullYear()}-${pad(tom.getMonth()+1)}-${pad(tom.getDate())}`;
  if (dateStr === tomKey) return "Tomorrow";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

// ── Icons ──────────────────────────────────────────────────────────────────
const CalIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8654A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8654A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const WalletIcon= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8654A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const TrendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8654A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

// ── StatCard ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, Icon }) {
  return (
    <div style={s.card}>
      <div style={s.cardLeft}>
        <div style={s.cardLabel}>{label}</div>
        <div style={s.cardValue}>{value}</div>
        {sub && <div style={s.cardSub}>{sub}</div>}
      </div>
      <div style={s.cardIcon}><Icon /></div>
    </div>
  );
}

// ── WeekChart ──────────────────────────────────────────────────────────────
function getChartScale(monthSpent) {
  const brackets = [
    { limit: 1000,   step: 200   },
    { limit: 5000,   step: 1000  },
    { limit: 10000,  step: 2000  },
    { limit: 50000,  step: 10000 },
    { limit: 100000, step: 20000 },
  ];
  const { step } = brackets.find(({ limit }) => monthSpent < limit) ?? { step: 50000 };
  const max = Math.ceil((monthSpent || step) / step) * step;
  return { max, step };
}

function WeekChart({ data, monthSpent }) {
  const [tooltip, setTooltip] = useState(null); // { x, y, segments }
  const { max, step } = getChartScale(monthSpent || 0);
  const yTicks = Array.from({ length: max / step + 1 }, (_, i) => max - i * step);

  return (
    <div style={{ position: "relative" }} ref={(el) => { if (el) el._chartRoot = true; }} data-chartroot="1">
      <div style={s.chartOuter}>
        <div style={s.yAxis}>
          {yTicks.map((v, i) => (
            <span key={i} style={s.yLabel}>${Math.round(v)}</span>
          ))}
        </div>
        <div style={s.barsArea}>
          {data.map(({ label, amount, categories, incomeAmount, incomeCategories }) => {
            const totalPct = (amount / max) * 100;
            const segments = Object.entries(categories)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => a - b);
            const incomeSegments = Object.entries(incomeCategories || {})
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a);

            return (
              <div key={label} style={s.barCol}>
                <div style={s.barTrack}>
                  {amount > 0 ? (
                    <div
                      style={{ width: "100%", height: `${totalPct}%`, display: "flex", flexDirection: "column", borderRadius: "4px 4px 0 0", overflow: "hidden", cursor: "default" }}
                      onMouseEnter={(e) => {
                        const barRect = e.currentTarget.getBoundingClientRect();
                        const rootEl = e.currentTarget.closest("[data-chartroot]");
                        const rootRect = rootEl.getBoundingClientRect();
                        setTooltip({
                          x: barRect.left - rootRect.left + barRect.width / 2,
                          y: barRect.top - rootRect.top,
                          segments: [...segments].reverse(),
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {segments.map(([cat, val], i) => (
                        <div
                          key={cat}
                          style={{
                            flex: val / amount,
                            background: CAT_COLORS[cat] || "#9B97A8",
                            minHeight: 4,
                            borderRadius: i === 0 ? "4px 4px 0 0" : 0,
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <span style={s.barLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          {tooltip.segments.map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[cat] || "#9B97A8", flexShrink: 0 }} />
              <span style={{ textTransform: "capitalize", flex: 1 }}>{cat}</span>
              <span style={{ fontWeight: 700, marginLeft: 12 }}>${val.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 4, paddingTop: 4, display: "flex", justifyContent: "space-between", gap: 24 }}>
            <span style={{ opacity: 0.7 }}>Total</span>
            <span style={{ fontWeight: 700 }}>${tooltip.segments.reduce((s, [, v]) => s + v, 0).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WeekIncomeChart ────────────────────────────────────────────────────────
function WeekIncomeChart({ data, monthIncome }) {
  const [tooltip, setTooltip] = useState(null);
  const { max, step } = getChartScale(monthIncome || 0);
  const yTicks = Array.from({ length: max / step + 1 }, (_, i) => max - i * step);

  return (
    <div style={{ position: "relative" }} data-chartroot="1">
      <div style={s.chartOuter}>
        <div style={s.yAxis}>
          {yTicks.map((v, i) => (
            <span key={i} style={s.yLabel}>${Math.round(v)}</span>
          ))}
        </div>
        <div style={s.barsArea}>
          {data.map(({ label, incomeAmount, incomeCategories }) => {
            const totalPct = (incomeAmount / max) * 100;
            const segments = Object.entries(incomeCategories || {})
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => a - b);

            return (
              <div key={label} style={s.barCol}>
                <div style={s.barTrack}>
                  {incomeAmount > 0 ? (
                    <div
                      style={{ width: "100%", height: `${totalPct}%`, display: "flex", flexDirection: "column", borderRadius: "4px 4px 0 0", overflow: "hidden", cursor: "default" }}
                      onMouseEnter={(e) => {
                        const barRect = e.currentTarget.getBoundingClientRect();
                        const rootEl  = e.currentTarget.closest("[data-chartroot]");
                        const rootRect = rootEl.getBoundingClientRect();
                        setTooltip({
                          x: barRect.left - rootRect.left + barRect.width / 2,
                          y: barRect.top - rootRect.top,
                          segments: [...segments].reverse(),
                          total: incomeAmount,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {segments.map(([cat, val], i) => (
                        <div
                          key={cat}
                          style={{
                            flex: val / incomeAmount,
                            background: INCOME_CAT_COLORS[cat] || "#2E7D32",
                            minHeight: 4,
                            borderRadius: i === 0 ? "4px 4px 0 0" : 0,
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <span style={s.barLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y - 8,
          transform: "translate(-50%, -100%)", background: "#1a1a2e", color: "#fff",
          borderRadius: 8, padding: "8px 12px", fontSize: 12, pointerEvents: "none",
          whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}>
          {tooltip.segments.map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: INCOME_CAT_COLORS[cat] || "#2E7D32", flexShrink: 0 }} />
              <span style={{ textTransform: "capitalize", flex: 1 }}>{cat}</span>
              <span style={{ fontWeight: 700, marginLeft: 12, color: "#81C784" }}>+${val.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 4, paddingTop: 4, display: "flex", justifyContent: "space-between", gap: 24 }}>
            <span style={{ opacity: 0.7 }}>Total</span>
            <span style={{ fontWeight: 700, color: "#81C784" }}>+${tooltip.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard({ events, expenses, onNavigateToEvent, isMobile }) {
  const today   = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Today's events
  const todayEvents = getEventsForDate(events, todayKey);

  // Upcoming events — next 180 days, deduped
  const upcoming = [];
  const seen = new Set();
  for (let i = 0; i < 180; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
    for (const ev of getEventsForDate(events, key)) {
      if (!seen.has(ev.id)) { seen.add(ev.id); upcoming.push({ ...ev, _displayDate: key }); }
    }
  }

  // Expenses this month
  const pad = (n) => String(n).padStart(2, "0");
  const monthPrefix = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const monthExpenses = (expenses || []).filter((e) => e.date.startsWith(monthPrefix) && e.type !== "income");
  const monthSpent    = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const monthIncome   = (expenses || []).filter((e) => e.date.startsWith(monthPrefix) && e.type === "income").reduce((s, e) => s + Number(e.amount), 0);

  // This week's spending — Mon → Sun
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const weekData = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
    const dayAll      = (expenses || []).filter((e) => e.date === key);
    const daySpending = dayAll.filter((e) => e.type !== "income");
    const dayIncome   = dayAll.filter((e) => e.type === "income");

    const amount = daySpending.reduce((s, e) => s + Number(e.amount), 0);
    const categories = {};
    for (const e of daySpending) {
      const cat = (e.category || "other").toLowerCase();
      categories[cat] = (categories[cat] || 0) + Number(e.amount);
    }
    const incomeCategories = {};
    for (const e of dayIncome) {
      const cat = (e.category || "other").toLowerCase();
      incomeCategories[cat] = (incomeCategories[cat] || 0) + Number(e.amount);
    }
    const incomeAmount = dayIncome.reduce((s, e) => s + Number(e.amount), 0);
    return { label, amount, categories, incomeAmount, incomeCategories };
  });

  return (
    <div style={{ ...s.page, padding: isMobile ? "16px" : "32px 28px", paddingBottom: isMobile ? 88 : "32px" }}>
      {/* Greeting */}
      <div style={s.greet}>
        <h2 style={{ ...s.greetTitle, fontSize: isMobile ? 24 : 32 }}>{greeting()}</h2>
        <p style={s.greetDate}>{formatFullDate(today)}</p>
      </div>

      {/* Stat cards */}
      <div style={{ ...s.statsRow, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}>
        <StatCard label="TODAY'S EVENTS"    value={todayEvents.length}               Icon={CalIcon} />
        <StatCard label="UPCOMING EVENTS"   value={upcoming.length}                  Icon={ClockIcon} />
        <StatCard label="THIS MONTH SPENT"  value={`$${monthSpent.toFixed(2)}`}      Icon={WalletIcon} />
        <StatCard label="TRANSACTIONS"      value={monthExpenses.length} sub="This month" Icon={TrendIcon} />
      </div>

      {/* Main panel grid: Upcoming Events (left, tall) | Spending + Income (right, stacked) */}
      <div style={{ ...s.panelRow, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gridTemplateRows: "auto" }}>
        {/* Upcoming events — spans both rows on desktop */}
        <div style={{ ...s.panel, gridRow: isMobile ? "auto" : "1 / 3", display: "flex", flexDirection: "column" }}>
          <h3 style={s.panelTitle}>Upcoming Events</h3>
          {upcoming.length === 0 ? (
            <p style={s.empty}>No upcoming events</p>
          ) : (
            <div style={s.evList}>
              {upcoming.slice(0, 8).map((ev) => (
                <div
                  key={ev.id + ev._displayDate}
                  style={{ ...s.evRow, ...(onNavigateToEvent ? s.evRowClickable : {}) }}
                  onClick={onNavigateToEvent ? () => onNavigateToEvent(ev._displayDate) : undefined}
                  onMouseEnter={onNavigateToEvent ? (e) => { e.currentTarget.style.background = "#F5F0E8"; } : undefined}
                  onMouseLeave={onNavigateToEvent ? (e) => { e.currentTarget.style.background = ""; } : undefined}
                >
                  <div style={{ ...s.evAccent, background: ev.color }} />
                  <div style={s.evInfo}>
                    <span style={s.evTitle}>{ev.title}</span>
                    <span style={s.evMeta}>
                      {relativeDate(ev._displayDate)}
                      {ev.time && ` · ${ev.time}`}
                      {ev.recurrence && " · ↻"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly spending chart */}
        <div style={s.panel}>
          <h3 style={s.panelTitle}>This Week's Spending</h3>
          {weekData.every((d) => d.amount === 0) ? (
            <p style={s.empty}>No spending recorded this week</p>
          ) : (
            <WeekChart data={weekData} monthSpent={monthSpent} />
          )}
        </div>

        {/* Weekly income chart */}
        <div style={s.panel}>
          <h3 style={s.panelTitle}>This Week's Income</h3>
          {weekData.every((d) => d.incomeAmount === 0) ? (
            <p style={s.empty}>No income recorded this week</p>
          ) : (
            <WeekIncomeChart data={weekData} monthIncome={monthIncome} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "32px 28px", display: "flex", flexDirection: "column", gap: 28, flex: 1 },

  greet: { },
  greetTitle: { fontSize: 32, fontWeight: 700, margin: 0, color: "#1a1a2e", letterSpacing: "-0.5px" },
  greetDate:  { fontSize: 14, color: "#9B97A8", margin: "4px 0 0" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },

  card: {
    background: "#fff", border: "1px solid #E8E0D0", borderRadius: 16,
    padding: "20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  cardLeft: { display: "flex", flexDirection: "column", gap: 6 },
  cardLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#9B97A8" },
  cardValue: { fontSize: 30, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 },
  cardSub:   { fontSize: 12, color: "#9B97A8" },
  cardIcon:  { width: 48, height: 48, borderRadius: "50%", background: "#E8654A15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  panelRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 20, alignItems: "start" },

  panel: { background: "#fff", border: "1px solid #E8E0D0", borderRadius: 16, padding: "24px" },
  panelTitle: { fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 20px" },
  empty: { fontSize: 13, color: "#9B97A8", margin: 0 },

  evList: { display: "flex", flexDirection: "column", gap: 0 },
  evRow:  { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F0ECE8" },
  evRowClickable: { cursor: "pointer", borderRadius: 8, margin: "0 -8px", padding: "10px 8px", transition: "background 0.15s" },
  evAccent: { width: 4, height: 36, borderRadius: 4, flexShrink: 0 },
  evInfo: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  evTitle: { fontSize: 14, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  evMeta:  { fontSize: 12, color: "#9B97A8" },

  chartOuter: { display: "flex", gap: 12, alignItems: "stretch", height: 160 },
  yAxis: { display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 24 },
  yLabel: { fontSize: 11, color: "#9B97A8", textAlign: "right" },
  barsArea: { display: "flex", gap: 8, alignItems: "flex-end", flex: 1, paddingBottom: 0 },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" },
  barTrack: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  bar: { width: "100%", background: "#E8654A", borderRadius: "4px 4px 0 0", transition: "height 0.3s" },
  barLabel: { fontSize: 11, color: "#9B97A8", flexShrink: 0 },
};
