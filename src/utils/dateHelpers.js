import { doesRecurOnDate } from "./recurrenceHelpers";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
export const MONTHS_FULL = MONTHS;
export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const COLORS = [
  "#E8654A", "#D4A03C", "#5AA867", "#4A8FE8",
  "#9B6AD4", "#D4567A", "#3CBCB4", "#E88D4A",
];

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
export function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
export function isToday(y, m, d) {
  const t = new Date();
  return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
}
export function uid() {
  return crypto.randomUUID();
}

// Returns all events that cover dateKey, including range events and recurring events.
export function getEventsForDate(allEvents, dateKey) {
  const result = [];
  for (const evArray of Object.values(allEvents)) {
    for (const ev of evArray) {
      if (ev.date === dateKey) {
        result.push(ev);
      } else if (ev.endDate && ev.date <= dateKey && ev.endDate >= dateKey) {
        result.push(ev);
      } else if (ev.recurrence && doesRecurOnDate(ev, dateKey)) {
        result.push(ev);
      }
    }
  }
  return result.sort((a, b) => a.time.localeCompare(b.time));
}
