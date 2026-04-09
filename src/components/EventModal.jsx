import { useState, useRef, useEffect } from "react";
import { COLORS, uid } from "../utils/dateHelpers";
import { modalStyles } from "../utils/modalStyles";
import { eventsToICS } from "../utils/icsParser";
import RecurrenceEditor from "./RecurrenceEditor";
import DatePicker from "./DatePicker";

const TABS = ["Single", "Range"];

export default function EventModal({ date, event, onSave, onDelete, onClose }) {
  const isEdit = !!event;
  const [tab,        setTab]        = useState(event?.endDate ? "Range" : "Single");
  const [title,      setTitle]      = useState(event?.title || "");
  const [time,       setTime]       = useState(event?.time  || "09:00");
  const [desc,       setDesc]       = useState(event?.desc  || "");
  const [color,      setColor]      = useState(event?.color || COLORS[0]);
  const [singleDate, setSingleDate] = useState(event?.date  || date);
  const [startDate,  setStartDate]  = useState(event?.date  || date);
  const [endDate,    setEndDate]    = useState(event?.endDate || event?.date || date);
  const [recurrence, setRecurrence] = useState(event?.recurrence || null);

  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleExport = () => {
    const ev = event;
    const { ics } = eventsToICS({ [ev.date]: [ev] });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${ev.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (tab === "Single") {
      onSave({ id: event?.id || uid(), title: title.trim(), time, desc, color, date: singleDate, recurrence: recurrence || undefined });
    } else {
      const effectiveEnd = endDate >= startDate ? endDate : startDate;
      onSave({ id: event?.id || uid(), title: title.trim(), time, desc, color, date: startDate, endDate: effectiveEnd !== startDate ? effectiveEnd : undefined });
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{isEdit ? "Edit Event" : "New Event"}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t}
              style={{ ...styles.tabBtn, ...(tab === t ? styles.tabBtnActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Single" && (
          <div>
            <label style={styles.label}>Date</label>
            <DatePicker value={singleDate} onChange={setSingleDate} style={{ marginBottom: 12 }} />
            <RecurrenceEditor recurrence={recurrence} onChange={setRecurrence} />
          </div>
        )}

        {tab === "Range" && (
          <div style={styles.dateRow}>
            <div style={styles.dateCol}>
              <label style={styles.label}>Start</label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div style={styles.dateCol}>
              <label style={styles.label}>End</label>
              <DatePicker value={endDate} onChange={setEndDate} min={startDate} />
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          style={{ ...styles.input, marginTop: 12 }}
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <input
          type="time"
          style={styles.input}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <textarea
          style={{ ...styles.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
          placeholder="Notes (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div style={styles.colorRow}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                ...styles.colorDot,
                background: c,
                outline: color === c ? `2px solid ${c}` : "2px solid transparent",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        <div style={styles.modalActions}>
          <div style={{ display: "flex", gap: 8 }}>
            {isEdit && (
              <button style={styles.deleteBtn} onClick={() => onDelete(event.id, event.date)}>
                Delete
              </button>
            )}
            {isEdit && (
              <button style={styles.exportBtn} onClick={handleExport}>
                ↓ Export
              </button>
            )}
          </div>
          <button style={styles.saveBtn} onClick={handleSave}>
            {isEdit ? "Update" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  ...modalStyles,
  modal: {
    background: "#ffffff",
    borderRadius: 16, padding: 28,
    width: 420, maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid #E8E0D0",
  },
  tabs: { ...modalStyles.tabs, marginBottom: 16 },
  dateRow: { display: "flex", gap: 12 },
  dateCol: { flex: 1 },
  modalActions: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  deleteBtn: {
    background: "transparent", border: "1px solid #E8E0D0",
    color: "#E8654A", borderRadius: 8, padding: "8px 16px",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  exportBtn: {
    background: "transparent", border: "1px solid #E8E0D0",
    color: "#1a1a2e", borderRadius: 8, padding: "8px 16px",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
};
