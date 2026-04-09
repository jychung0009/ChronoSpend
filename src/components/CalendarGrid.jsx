import { DAYS, toKey, getEventsForDate } from "../utils/dateHelpers";
import { barSegmentStyle } from "../utils/eventStyles";
import DayCell from "./DayCell";

function cellKey(c) {
  return toKey(c.year, c.month, c.day);
}

export default function CalendarGrid({ cells, events: allEvents, selectedDate, onAdd, onEdit, onDragStart, onDrop }) {
  const rangeEvents = Object.values(allEvents)
    .flat()
    .filter((ev) => ev.endDate && ev.endDate > ev.date);

  const rows = Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <>
      {/* Day name headers */}
      <div style={styles.dayNames}>
        {DAYS.map((d) => (
          <div key={d} style={styles.dayName}>{d}</div>
        ))}
      </div>

      {/* Calendar rows */}
      <div style={styles.calendar}>
        {rows.filter((r) => r.length > 0).map((rowCells, rowIdx) => {
          const rowStart = cellKey(rowCells[0]);
          const rowEnd   = cellKey(rowCells[rowCells.length - 1]);
          const rowRangeEvs = rangeEvents.filter(
            (ev) => ev.date <= rowEnd && ev.endDate >= rowStart
          );
          const barCount = rowRangeEvs.length;

          return (
            <div key={rowIdx} style={styles.weekRow}>
              <div style={styles.grid}>
                {rowCells.map((c, i) => {
                  const key = cellKey(c);
                  const dayEvents = getEventsForDate(allEvents, key).filter(
                    (ev) => !ev.endDate || ev.endDate === ev.date
                  );
                  return (
                    <DayCell
                      key={i}
                      day={c.day}
                      month={c.month}
                      year={c.year}
                      events={dayEvents}
                      isCurrentMonth={c.current}
                      isSelected={key === selectedDate}
                      onAdd={onAdd}
                      onEdit={onEdit}
                      onDragStart={onDragStart}
                      onDrop={onDrop}
                      topPad={barCount * 24}
                    />
                  );
                })}
              </div>

              {barCount > 0 && (
                <div style={{ ...styles.rangeBarGrid, position: "absolute", top: 35, left: 0, right: 0, zIndex: 2, pointerEvents: "none" }}>
                  {rowRangeEvs.map((ev, barIdx) => {
                    const isStart  = ev.date >= rowStart;
                    const isEnd    = ev.endDate <= rowEnd;
                    const startCol = isStart ? rowCells.findIndex((c) => cellKey(c) === ev.date) : 0;
                    const endCol   = isEnd   ? rowCells.findIndex((c) => cellKey(c) === ev.endDate) : rowCells.length - 1;
                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEdit(ev); }}
                        style={{
                          ...barSegmentStyle(ev, isStart, isEnd),
                          gridColumn: `${startCol + 1} / ${endCol + 2}`,
                          gridRow: barIdx + 1,
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
          );
        })}
      </div>
    </>
  );
}

const styles = {
  dayNames: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    borderBottom: "1px solid #E8E0D0",
    padding: "0 0",
  },
  dayName: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#8B8599",
    padding: "10px 0",
  },
  calendar: {
    display: "flex",
    flexDirection: "column",
  },
  weekRow: {
    position: "relative",
  },
  rangeBarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridAutoRows: 22,
    gap: "2px 0",
    marginBottom: 2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
  },
};
