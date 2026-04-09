export function barSegmentStyle(ev, isStart, isEnd) {
  return {
    background: ev.color + "20",
    borderLeft: isStart ? `3px solid ${ev.color}` : "3px solid transparent",
    borderTop: `1px solid ${ev.color}44`,
    borderBottom: `1px solid ${ev.color}44`,
    borderRight: isEnd ? `1px solid ${ev.color}44` : "none",
    borderRadius: [
      isStart ? 4 : 0, isEnd ? 4 : 0, isEnd ? 4 : 0, isStart ? 4 : 0,
    ].map((r) => `${r}px`).join(" "),
    color: ev.color,
    fontSize: 11,
    fontWeight: 600,
    padding: "0 6px",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  };
}
