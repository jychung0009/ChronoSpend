import { useState, useRef } from "react";
import { COLORS, uid } from "../utils/dateHelpers";
import { modalStyles } from "../utils/modalStyles";
import { parseICS, icsEventsToAppEvents } from "../utils/icsParser";
import RecurrenceEditor from "./RecurrenceEditor";
import DatePicker from "./DatePicker";

const TABS = ["Single", "Range", "Import"];

function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function daysBetween(start, end) {
  const ms = new Date(end + "T00:00:00") - new Date(start + "T00:00:00");
  return Math.round(ms / 86400000) + 1;
}

export default function CreateEventModal({ defaultDate, defaultTab, onSave, onSaveBatch, onClose }) {
  const base = defaultDate || todayStr();
  const [tab,  setTab]  = useState(defaultTab || "Single");
  const [title, setTitle] = useState("");
  const [time,  setTime]  = useState("09:00");
  const [desc,  setDesc]  = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [recurrence,    setRecurrence]    = useState(null);
  const [singleDate,    setSingleDate]    = useState(base);
  const [startDate,     setStartDate]     = useState(base);
  const [endDate,       setEndDate]       = useState(base);
  const [importedEvents, setImportedEvents] = useState(null);
  const [importError,   setImportError]   = useState("");
  const [isDragging,    setIsDragging]    = useState(false);
  const fileRef = useRef(null);

  const handleSaveSingle = () => {
    if (!title.trim()) return;
    onSave({ id: uid(), title: title.trim(), time, desc, color, date: singleDate, recurrence: recurrence || undefined });
    onClose();
  };

  const handleSaveRange = () => {
    if (!title.trim() || !startDate || !endDate || startDate > endDate) return;
    onSave({ id: uid(), title: title.trim(), time, desc, color, date: startDate, endDate: endDate !== startDate ? endDate : undefined });
    onClose();
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".ics")) {
      setImportError("Please select a valid .ics calendar file.");
      setImportedEvents(null);
      return;
    }
    setImportError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed    = parseICS(e.target.result);
        const appEvents = icsEventsToAppEvents(parsed);
        if (appEvents.length === 0) {
          setImportError("No events found in this file.");
          setImportedEvents(null);
        } else {
          setImportedEvents(appEvents);
        }
      } catch {
        setImportError("Could not parse this file.");
        setImportedEvents(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importedEvents?.length) return;
    onSaveBatch(importedEvents);
    onClose();
  };

  const rangeCount = startDate && endDate && startDate <= endDate ? daysBetween(startDate, endDate) : 0;

  const EventFields = (
    <>
      <input
        autoFocus
        style={styles.input}
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          if (tab === "Single") handleSaveSingle();
          else if (tab === "Range") handleSaveRange();
        }}
      />
      <input
        type="time"
        style={styles.input}
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <textarea
        style={{ ...styles.input, minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
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
    </>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>New Event</span>
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
            {EventFields}
            <div style={styles.actions}>
              <button style={styles.saveBtn} onClick={handleSaveSingle}>Add Event</button>
            </div>
          </div>
        )}

        {tab === "Range" && (
          <div>
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
            {rangeCount > 0 && (
              <p style={styles.rangeHint}>Spans {rangeCount} day{rangeCount !== 1 ? "s" : ""}</p>
            )}
            <div style={{ marginTop: 12 }}>{EventFields}</div>
            <div style={styles.actions}>
              <button
                style={{ ...styles.saveBtn, opacity: !title.trim() || startDate > endDate ? 0.45 : 1, cursor: !title.trim() || startDate > endDate ? "not-allowed" : "pointer" }}
                onClick={handleSaveRange}
              >
                Add Event
              </button>
            </div>
          </div>
        )}

        {tab === "Import" && (
          <div>
            <div
              style={{
                ...styles.dropZone,
                borderColor: isDragging ? "#E8654A" : "#D0CCDA",
                background:  isDragging ? "#E8654A08" : "#F9F6F1",
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9B97A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p style={styles.dropPrimary}>Drop a .ics file here</p>
              <p style={styles.dropSecondary}>or click to browse — works with Google Calendar, Outlook, Apple Calendar</p>
              <input ref={fileRef} type="file" accept=".ics" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            {importError && <p style={styles.importError}>{importError}</p>}

            {importedEvents && (
              <>
                <p style={styles.importSuccess}>Found {importedEvents.length} event{importedEvents.length !== 1 ? "s" : ""} — ready to import</p>
                <div style={styles.importList}>
                  {importedEvents.slice(0, 5).map((ev) => (
                    <div key={ev.id} style={{ ...styles.importItem, borderLeft: `3px solid ${ev.color}` }}>
                      <span style={styles.importDate}>{ev.date}</span>
                      <span style={styles.importTitle}>{ev.title}</span>
                      <span style={styles.importTime}>{ev.time}</span>
                    </div>
                  ))}
                  {importedEvents.length > 5 && (
                    <p style={styles.importMore}>+{importedEvents.length - 5} more</p>
                  )}
                </div>
                <div style={styles.actions}>
                  <button style={styles.saveBtn} onClick={handleImport}>
                    Import {importedEvents.length} Event{importedEvents.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  ...modalStyles,
  modal: {
    background: "#ffffff",
    borderRadius: 16, padding: 28,
    width: 460, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid #E8E0D0",
  },
  tabs: { ...modalStyles.tabs, marginBottom: 20 },
  actions:  { display: "flex", justifyContent: "flex-end" },
  saveBtn:  { background: "#E8654A", border: "none", color: "#fff", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  dateRow:  { display: "flex", gap: 12, marginBottom: 4 },
  dateCol:  { flex: 1 },
  rangeHint: { fontSize: 12, color: "#9B97A8", margin: "6px 0 14px" },
  dropZone: {
    border: "1.5px dashed", borderRadius: 12,
    padding: "32px 20px", textAlign: "center", cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s", marginBottom: 16,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
  },
  dropPrimary:   { margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a2e" },
  dropSecondary: { margin: 0, fontSize: 12, color: "#9B97A8", maxWidth: 280, lineHeight: 1.5 },
  importError:   { fontSize: 13, color: "#E8654A", margin: "0 0 12px" },
  importSuccess: { fontSize: 13, color: "#5AA867", margin: "0 0 10px", fontWeight: 600 },
  importList:    { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  importItem:    { display: "flex", alignItems: "center", gap: 10, background: "#F9F6F1", borderRadius: 8, padding: "8px 12px" },
  importDate:    { fontSize: 11, color: "#9B97A8", fontWeight: 600, whiteSpace: "nowrap" },
  importTitle:   { fontSize: 13, color: "#1a1a2e", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  importTime:    { fontSize: 11, color: "#9B97A8", whiteSpace: "nowrap" },
  importMore:    { fontSize: 12, color: "#9B97A8", margin: "4px 0 0 12px" },
};
