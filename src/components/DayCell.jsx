import { toKey, isToday } from "../utils/dateHelpers";

export default function DayCell({ day, month, year, events, isCurrentMonth, isSelected, onAdd, onEdit, onDragStart, onDrop, topPad = 0 }) {
  const key   = toKey(year, month, day);
  const today = isToday(year, month, day);

  return (
    <div
      style={{
        ...styles.cell,
        background: isSelected && isCurrentMonth
          ? "#FFF5F2"
          : isCurrentMonth ? "#ffffff" : "#F9F6F1",
        opacity: isCurrentMonth ? 1 : 0.5,
        outline: isSelected && isCurrentMonth ? "2px solid #E8654A" : "none",
        outlineOffset: "-2px",
      }}
      onClick={() => isCurrentMonth && onAdd(key)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop?.(key); }}
    >
      <span
        style={{
          ...styles.dayNum,
          background: today ? "#E8654A" : "transparent",
          color:      today ? "#fff"    : isCurrentMonth ? "#1a1a2e" : "#9B97A8",
          fontWeight: today ? 700 : 500,
        }}
      >
        {day}
      </span>
      <div style={{ ...styles.eventList, marginTop: 4 + topPad }}>
        {(events || []).slice(0, 3).map((ev) => (
          <div
            key={ev.id}
            draggable
            onDragStart={(e) => { e.stopPropagation(); onDragStart(ev); }}
            onClick={(e) => { e.stopPropagation(); onEdit(ev); }}
            style={{
              ...styles.eventChip,
              background:  ev.color + "18",
              borderLeft:  `3px solid ${ev.color}`,
              color:        ev.color,
            }}
          >
            <span style={styles.chipTime}>{ev.time}</span>
            {ev.title}
            {ev.recurrence && <span style={{ opacity: 0.6, marginLeft: 3 }}>↻</span>}
          </div>
        ))}
        {(events || []).length > 3 && (
          <span style={styles.moreLabel}>+{events.length - 3} more</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  cell: {
    minHeight: 90,
    padding: "6px 8px",
    cursor: "pointer",
    borderRight:  "1px solid #E8E0D0",
    borderBottom: "1px solid #E8E0D0",
    transition: "background 0.12s",
    overflow: "hidden",
  },
  dayNum: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: "50%",
    fontSize: 13,
  },
  eventList: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  eventChip: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 6px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "grab",
    transition: "transform 0.1s",
  },
  chipTime:  { fontSize: 10, opacity: 0.7, marginRight: 3 },
  moreLabel: { fontSize: 10, color: "#9B97A8", paddingLeft: 4 },
};
