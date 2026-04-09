import { useState } from "react";
import { modalStyles } from "../utils/modalStyles";
import { eventsToICS } from "../utils/icsParser";
import DatePicker from "./DatePicker";

function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export default function ExportModal({ events, onClose }) {
  const [filterMode, setFilterMode] = useState("all"); // "all" | "range"
  const [fromDate,   setFromDate]   = useState(todayStr());
  const [toDate,     setToDate]     = useState(todayStr());
  const [exported,   setExported]   = useState(false);

  const from = filterMode === "range" ? fromDate : null;
  const to   = filterMode === "range" ? toDate   : null;
  const { count, events: matching } = eventsToICS(events, from, to);

  const getICS = () => eventsToICS(events, from, to).ics;

  const handleDownload = () => {
    const ics  = getICS();
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "scheduling-app-events.ics";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  const handleEmail = () => {
    handleDownload();

    const subject = encodeURIComponent("My calendar events");
    const bodyLines = [
      `Here are my calendar events (${count} total):`,
      "",
      ...matching.slice(0, 20).map((ev) => {
        const dateStr = ev.date;
        const time    = ev.time ? ` at ${ev.time}` : "";
        const range   = ev.endDate && ev.endDate !== ev.date ? ` → ${ev.endDate}` : "";
        return `• ${ev.title}  |  ${dateStr}${range}${time}`;
      }),
      ...(count > 20 ? [`  …and ${count - 20} more`] : []),
      "",
      "I've attached the .ics file — open it to add these events to your calendar.",
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const rangeValid = filterMode === "all" || (fromDate && toDate && fromDate <= toDate);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Export Events</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Filter mode */}
        <label style={styles.label}>Export</label>
        <div style={styles.segmented}>
          {[["all", "All events"], ["range", "Date range"]].map(([val, label]) => (
            <button
              key={val}
              style={{ ...styles.segBtn, ...(filterMode === val ? styles.segBtnActive : {}) }}
              onClick={() => setFilterMode(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {filterMode === "range" && (
          <div style={styles.dateRow}>
            <div style={styles.dateCol}>
              <label style={styles.label}>From</label>
              <DatePicker value={fromDate} onChange={(v) => { setFromDate(v); if (v > toDate) setToDate(v); }} />
            </div>
            <div style={styles.dateCol}>
              <label style={styles.label}>To</label>
              <DatePicker value={toDate} onChange={setToDate} min={fromDate} />
            </div>
          </div>
        )}

        {/* Preview */}
        <div style={styles.preview}>
          {!rangeValid ? (
            <span style={styles.previewWarn}>End date must be on or after start date.</span>
          ) : count === 0 ? (
            <span style={styles.previewWarn}>No events found in this range.</span>
          ) : (
            <>
              <span style={styles.previewCount}>{count}</span>
              <span style={styles.previewLabel}> event{count !== 1 ? "s" : ""} will be exported</span>
              {matching.slice(0, 3).map((ev) => (
                <div key={ev.id} style={{ ...styles.previewItem, borderLeft: `3px solid ${ev.color || "#9B97A8"}` }}>
                  <span style={styles.previewDate}>{ev.date}</span>
                  <span style={styles.previewTitle}>{ev.title}</span>
                </div>
              ))}
              {count > 3 && <p style={styles.previewMore}>+{count - 3} more</p>}
            </>
          )}
        </div>

        {/* Hint after download */}
        {exported && (
          <p style={styles.hint}>
            .ics downloaded — attach it to your email to share as a calendar invite.
          </p>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={{ ...styles.secondaryBtn, opacity: !rangeValid || count === 0 ? 0.4 : 1, cursor: !rangeValid || count === 0 ? "not-allowed" : "pointer" }}
            onClick={!rangeValid || count === 0 ? undefined : handleEmail}
          >
            <IconMail /> Share via Email
          </button>
          <button
            style={{ ...styles.primaryBtn, opacity: !rangeValid || count === 0 ? 0.4 : 1, cursor: !rangeValid || count === 0 ? "not-allowed" : "pointer" }}
            onClick={!rangeValid || count === 0 ? undefined : handleDownload}
          >
            <IconDownload /> Download .ics
          </button>
        </div>
      </div>
    </div>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

const styles = {
  ...modalStyles,
  modal: {
    background: "#ffffff",
    borderRadius: 16, padding: 28,
    width: 440, maxWidth: "92vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid #E8E0D0",
  },
  segmented: {
    display: "flex", background: "#F5F0E8",
    borderRadius: 8, padding: 3, marginBottom: 18, gap: 2,
  },
  segBtn: {
    flex: 1, background: "transparent", color: "#8B8599", border: "none",
    borderRadius: 6, padding: "7px 0", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  },
  segBtnActive: { background: "#ffffff", color: "#1a1a2e", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  dateRow: { display: "flex", gap: 12, marginBottom: 18 },
  dateCol: { flex: 1 },
  preview: {
    background: "#F9F6F1", borderRadius: 10, padding: "14px 16px",
    marginBottom: 8, display: "flex", flexDirection: "column", gap: 8, minHeight: 60,
  },
  previewCount: { fontSize: 22, fontWeight: 700, color: "#E8654A" },
  previewLabel: { fontSize: 13, color: "#6B6780" },
  previewWarn:  { fontSize: 13, color: "#9B97A8" },
  previewItem: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#ffffff", borderRadius: 7, padding: "6px 10px",
    paddingLeft: 10,
  },
  previewDate:  { fontSize: 11, color: "#9B97A8", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 },
  previewTitle: { fontSize: 13, color: "#1a1a2e", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  previewMore:  { fontSize: 12, color: "#9B97A8", margin: 0 },
  hint: {
    fontSize: 12, color: "#5AA867", margin: "6px 0 14px",
    background: "#5AA86710", borderRadius: 8, padding: "8px 12px",
  },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 },
  primaryBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  secondaryBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "transparent", border: "1px solid #E8E0D0", color: "#1a1a2e",
    borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
};
