import { DAYS } from "../utils/dateHelpers";
import DatePicker from "./DatePicker";

const REPEAT_OPTIONS = [
  { value: "none",        label: "Does not repeat" },
  { value: "weekly",      label: "Every week" },
  { value: "monthly",     label: "Every month" },
  { value: "monthly-nth", label: "Every month on the…" },
  { value: "yearly",      label: "Every year" },
];

const NTH_LABELS = [
  { value: 1,  label: "1st" },
  { value: 2,  label: "2nd" },
  { value: 3,  label: "3rd" },
  { value: 4,  label: "4th" },
  { value: -1, label: "Last" },
];

const DAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function RecurrenceEditor({ recurrence, onChange }) {
  const type = recurrence?.type || "none";

  const setType = (t) => {
    if (t === "none")        return onChange(null);
    if (t === "weekly")      return onChange({ type: "weekly", weekdays: [1] });
    if (t === "monthly")     return onChange({ type: "monthly" });
    if (t === "monthly-nth") return onChange({ type: "monthly-nth", nth: 1, weekday: 1 });
    if (t === "yearly")      return onChange({ type: "yearly" });
  };

  const setUntil = (val) => onChange({ ...recurrence, until: val || undefined });

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>Repeat</label>
      <select style={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
        {REPEAT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {type === "weekly" && (
        <div style={styles.weekdayRow}>
          {DAY_SHORT.map((label, i) => {
            const active = recurrence.weekdays?.includes(i);
            return (
              <button
                key={i}
                style={{
                  ...styles.dayChip,
                  background: active ? "#E8654A" : "#F9F6F1",
                  color:      active ? "#fff"    : "#6B6780",
                  border:     active ? "1px solid #E8654A" : "1px solid #E8E0D0",
                }}
                onClick={() => {
                  const current = recurrence.weekdays || [];
                  const next = active
                    ? current.filter((d) => d !== i)
                    : [...current, i].sort((a, b) => a - b);
                  if (next.length > 0) onChange({ ...recurrence, weekdays: next });
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {type === "monthly-nth" && (
        <div style={styles.nthRow}>
          <select
            style={{ ...styles.select, flex: 1, marginBottom: 0 }}
            value={recurrence.nth}
            onChange={(e) => onChange({ ...recurrence, nth: Number(e.target.value) })}
          >
            {NTH_LABELS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            style={{ ...styles.select, flex: 2, marginBottom: 0 }}
            value={recurrence.weekday}
            onChange={(e) => onChange({ ...recurrence, weekday: Number(e.target.value) })}
          >
            {DAYS.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {type !== "none" && (
        <div style={{ marginTop: 10 }}>
          <label style={styles.label}>End date (optional)</label>
          <DatePicker value={recurrence?.until || ""} onChange={setUntil} />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { marginBottom: 12 },
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.8px",
    color: "#8B8599", marginBottom: 6,
  },
  select: {
    width: "100%", padding: "10px 14px",
    borderRadius: 10, border: "1px solid #E8E0D0",
    background: "#F9F6F1", color: "#1a1a2e",
    fontSize: 14, outline: "none", marginBottom: 10,
    boxSizing: "border-box", cursor: "pointer",
  },
  weekdayRow: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  dayChip: {
    width: 36, height: 36, borderRadius: 8,
    fontSize: 12, fontWeight: 700, cursor: "pointer",
    transition: "background 0.15s",
  },
  nthRow: { display: "flex", gap: 8, marginBottom: 10 },
};
