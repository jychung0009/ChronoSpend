import { useState, useRef, useEffect } from "react";
import { getDaysInMonth, getFirstDayOfMonth, toKey, isToday, MONTHS } from "../utils/dateHelpers";

const DAY_HEADERS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function formatDisplay(dateStr) {
  if (!dateStr) return "Select date";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DatePicker({ value, onChange, min, style }) {
  const today = new Date();
  const [open,     setOpen]     = useState(false);
  const [calYear,  setCalYear]  = useState(value ? Number(value.split("-")[0]) : today.getFullYear());
  const [calMonth, setCalMonth] = useState(value ? Number(value.split("-")[1]) - 1 : today.getMonth());
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (open && value) {
      setCalYear(Number(value.split("-")[0]));
      setCalMonth(Number(value.split("-")[1]) - 1);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const firstDay     = getFirstDayOfMonth(calYear, calMonth);
  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const prevM = calMonth === 0 ? 11 : calMonth - 1;
  const prevY = calMonth === 0 ? calYear - 1 : calYear;
  const nextM = calMonth === 11 ? 0 : calMonth + 1;
  const nextY = calMonth === 11 ? calYear + 1 : calYear;
  const prevMonthDays = getDaysInMonth(prevY, prevM);

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, month: prevM, year: prevY, current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: calMonth, year: calYear, current: true });
  let nd = 1;
  while (cells.length < 42)
    cells.push({ day: nd++, month: nextM, year: nextY, current: false });

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const select = (cell) => {
    const key = toKey(cell.year, cell.month, cell.day);
    if (min && key < min) return;
    onChange(key);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", ...style }}>
      <button style={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <span>{formatDisplay(value)}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {open && (
        <div style={styles.popup}>
          <div style={styles.nav}>
            <button style={styles.navBtn} onClick={prevMonth}>‹</button>
            <span style={styles.monthLabel}>{MONTHS[calMonth]} {calYear}</span>
            <button style={styles.navBtn} onClick={nextMonth}>›</button>
          </div>
          <div style={styles.dayHeaders}>
            {DAY_HEADERS.map((d) => (
              <div key={d} style={styles.dayHeader}>{d}</div>
            ))}
          </div>
          <div style={styles.grid}>
            {cells.map((cell, i) => {
              const key      = toKey(cell.year, cell.month, cell.day);
              const selected = key === value;
              const isT      = isToday(cell.year, cell.month, cell.day);
              const disabled = min && key < min;
              const dimmed   = !cell.current;
              return (
                <button
                  key={i}
                  onClick={() => !disabled && select(cell)}
                  style={{
                    ...styles.dayCell,
                    opacity:    dimmed ? 0.3 : disabled ? 0.3 : 1,
                    cursor:     disabled || dimmed ? "default" : "pointer",
                    background: selected ? "#E8654A" : isT ? "#E8654A18" : "transparent",
                    color:      selected ? "#fff"    : isT ? "#E8654A"   : "#1a1a2e",
                    fontWeight: selected || isT ? 700 : 400,
                    border:     isT && !selected ? "1px solid #E8654A55" : "1px solid transparent",
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  trigger: {
    width: "100%", padding: "10px 14px",
    borderRadius: 10, border: "1px solid #E8E0D0",
    background: "#F9F6F1", color: "#1a1a2e",
    fontSize: 14, outline: "none", cursor: "pointer",
    boxSizing: "border-box",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8, textAlign: "left",
  },
  popup: {
    position: "absolute", top: "calc(100% + 6px)", left: 0,
    zIndex: 2000, background: "#ffffff",
    border: "1px solid #E8E0D0", borderRadius: 14,
    padding: "14px 12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    minWidth: 272,
  },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10,
  },
  navBtn: {
    background: "#F5F0E8", border: "none", color: "#1a1a2e",
    width: 28, height: 28, borderRadius: 6, fontSize: 18,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
  },
  monthLabel:  { fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  dayHeaders:  { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 },
  dayHeader:   { textAlign: "center", fontSize: 10, fontWeight: 700, color: "#8B8599", padding: "2px 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  grid:        { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 },
  dayCell:     { textAlign: "center", fontSize: 13, padding: "6px 2px", borderRadius: 6, transition: "background 0.1s" },
};
