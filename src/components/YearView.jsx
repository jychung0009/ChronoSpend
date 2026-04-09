import { DAYS, MONTHS, getDaysInMonth, getFirstDayOfMonth, toKey, isToday, getEventsForDate } from "../utils/dateHelpers";

export default function YearView({ year, events: allEvents, onMonthClick }) {
  return (
    <div style={styles.grid}>
      {MONTHS.map((monthName, m) => {
        const daysInMonth = getDaysInMonth(year, m);
        const firstDay    = getFirstDayOfMonth(year, m);
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        while (cells.length % 7 !== 0) cells.push(null);

        return (
          <div key={m} style={styles.monthCard} onClick={() => onMonthClick(m)}>
            <div style={styles.monthTitle}>{monthName}</div>
            <div style={styles.dayNames}>
              {DAYS.map((d) => (
                <span key={d} style={styles.dayName}>{d[0]}</span>
              ))}
            </div>
            <div style={styles.monthGrid}>
              {cells.map((day, i) => {
                if (!day) return <span key={i} />;
                const key       = toKey(year, m, day);
                const hasEvents = getEventsForDate(allEvents, key).length > 0;
                const today     = isToday(year, m, day);
                return (
                  <span
                    key={i}
                    style={{
                      ...styles.miniDay,
                      background: today ? "#E8654A" : hasEvents ? "#E8654A18" : "transparent",
                      color:      today ? "#fff"    : hasEvents ? "#E8654A"   : "#6B6780",
                      fontWeight: hasEvents || today ? 700 : 400,
                    }}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    padding: "16px",
  },
  monthCard: {
    background: "#ffffff",
    border: "1px solid #E8E0D0",
    borderRadius: 10,
    padding: "14px 10px",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  monthTitle: {
    fontSize: 13, fontWeight: 700, color: "#1a1a2e",
    marginBottom: 8, textAlign: "center",
  },
  dayNames: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 3,
  },
  dayName: {
    fontSize: 9, fontWeight: 700, textTransform: "uppercase",
    color: "#8B8599", textAlign: "center",
  },
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 1,
  },
  miniDay: {
    fontSize: 10, textAlign: "center",
    padding: "2px 0", borderRadius: 3, lineHeight: 1.6,
  },
};
