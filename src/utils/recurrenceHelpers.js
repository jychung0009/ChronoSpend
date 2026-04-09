/**
 * Returns the day-of-month for the nth occurrence of `weekday` in a given year/month.
 * nth: 1..4 (first–fourth), -1 (last)
 * weekday: 0–6 (Sun–Sat)
 * Returns null if that occurrence doesn't exist (e.g. 5th Monday in a 4-Monday month).
 */
export function getNthWeekdayOfMonth(year, month, nth, weekday) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  if (nth === -1) {
    for (let d = lastDay; d >= 1; d--)
      if (new Date(year, month, d).getDay() === weekday) return d;
  } else {
    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      if (new Date(year, month, d).getDay() === weekday) {
        count++;
        if (count === nth) return d;
      }
    }
  }
  return null;
}

/**
 * Returns true if the event's recurrence rule generates an occurrence on dateKey.
 * dateKey: "YYYY-MM-DD"
 */
export function doesRecurOnDate(ev, dateKey) {
  const { recurrence } = ev;
  if (!recurrence) return false;
  if (dateKey < ev.date) return false;
  if (recurrence.until && dateKey > recurrence.until) return false;

  const d = new Date(dateKey + "T00:00:00");
  const start = new Date(ev.date + "T00:00:00");

  switch (recurrence.type) {
    case "weekly":
      return Array.isArray(recurrence.weekdays) && recurrence.weekdays.includes(d.getDay());
    case "monthly":
      return d.getDate() === start.getDate();
    case "monthly-nth": {
      const nthDay = getNthWeekdayOfMonth(
        d.getFullYear(), d.getMonth(), recurrence.nth, recurrence.weekday
      );
      return nthDay !== null && d.getDate() === nthDay;
    }
    case "yearly":
      return d.getMonth() === start.getMonth() && d.getDate() === start.getDate();
    default:
      return false;
  }
}
