import { DAYS, isToday, getEventsForDate } from "../utils/dateHelpers";
import { barSegmentStyle } from "../utils/eventStyles";

export default function WeekView({ weekDays, events: allEvents, onAdd, onEdit, onDragStart, onDrop }) {
  const weekStart = weekDays[0].key;
  const weekEnd   = weekDays[6].key;

  const rangeEvents = Object.values(allEvents)
    .flat()
    .filter((ev) => ev.endDate && ev.endDate > ev.date && ev.date <= weekEnd && ev.endDate >= weekStart);

  return (
    <div style={styles.wrapper}>
      {/* Day headers */}
      <div style={styles.headerRow}>
        {weekDays.map(({ year, month, day, key }) => {
          const today    = isToday(year, month, day);
          const dayOfWeek = new Date(year, month, day).getDay();
          return (
            <div key={key} style={styles.columnHeader}>
              <span style={styles.dayLabel}>{DAYS[dayOfWeek]}</span>
              <span
                style={{
                  ...styles.dayCircle,
                  background: today ? "#E8654A" : "transparent",
                  color:      today ? "#fff"    : "#1a1a2e",
                }}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Columns + range bars */}
      <div style={{ position: "relative" }}>
        <div style={styles.columns}>
          {weekDays.map(({ key }) => {
            const dayEvents = getEventsForDate(allEvents, key).filter(
              (ev) => !ev.endDate || ev.endDate === ev.date
            );
            return (
              <div
                key={key}
                style={{ ...styles.column, paddingTop: 8 + rangeEvents.length * 24 }}
                onClick={() => onAdd(key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onDrop?.(key); }}
              >
                {dayEvents.length === 0 && (
                  <span style={styles.emptyHint}>+ add event</span>
                )}
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); onDragStart(ev); }}
                    onClick={(e) => { e.stopPropagation(); onEdit(ev); }}
                    style={{
                      ...styles.eventChip,
                      background: ev.color + "18",
                      borderLeft: `3px solid ${ev.color}`,
                      color:      ev.color,
                    }}
                  >
                    <div style={styles.chipTime}>{ev.time}</div>
                    <div style={styles.chipTitle}>
                      {ev.title}
                      {ev.recurrence && <span style={{ opacity: 0.6, marginLeft: 3 }}>↻</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {rangeEvents.length > 0 && (
          <div style={{ ...styles.rangeBarGrid, position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, pointerEvents: "none" }}>
            {rangeEvents.map((ev, barIdx) => {
              const isStart  = ev.date >= weekStart;
              const isEnd    = ev.endDate <= weekEnd;
              const startCol = isStart ? weekDays.findIndex((d) => d.key === ev.date) : 0;
              const endCol   = isEnd   ? weekDays.findIndex((d) => d.key === ev.endDate) : 6;
              return (
                <div
                  key={ev.id}
                  onClick={() => onEdit(ev)}
                  style={{
                    ...barSegmentStyle(ev, isStart, isEnd),
                    gridColumn: `${startCol + 1} / ${endCol + 2}`,
                    gridRow:    barIdx + 1,
                    pointerEvents: "auto",
                  }}
                >
                  {isStart && <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>{ev.time}</span>}
                  {isStart && ev.title}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper:  { display: "flex", flexDirection: "column" },
  headerRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    borderBottom: "1px solid #E8E0D0",
  },
  columnHeader: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 4, padding: "10px 0",
    borderRight: "1px solid #E8E0D0",
  },
  dayLabel: {
    fontSize: 10, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "1.5px", color: "#8B8599",
  },
  dayCircle: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, borderRadius: "50%", fontSize: 16, fontWeight: 600,
  },
  rangeBarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridAutoRows: 22,
    gap: "2px 0",
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    minHeight: 420,
  },
  column: {
    background: "#ffffff",
    borderRight: "1px solid #E8E0D0",
    padding: "8px 6px",
    cursor: "pointer",
    display: "flex", flexDirection: "column", gap: 4,
  },
  emptyHint: { fontSize: 11, color: "#D0CCDA", textAlign: "center", paddingTop: 8 },
  eventChip: { padding: "6px 8px", borderRadius: 6, cursor: "grab", transition: "transform 0.1s" },
  chipTime:  { fontSize: 10, opacity: 0.7, marginBottom: 1 },
  chipTitle: {
    fontSize: 12, fontWeight: 600,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
};
