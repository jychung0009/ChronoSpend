import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

// ── Mapping helpers ────────────────────────────────────────────────────────

/** App event object → DB row */
export function eventToDb(ev) {
  return {
    id:          ev.id,
    title:       ev.title,
    date:        ev.date,
    end_date:    ev.endDate    || null,
    time:        ev.time       || null,
    description: ev.desc       || null,
    color:       ev.color      || null,
    recurrence:  ev.recurrence || null,
  };
}

/** DB row → App event object */
export function dbToEvent(row) {
  return {
    id:    row.id,
    title: row.title,
    date:  row.date,
    ...(row.end_date    ? { endDate:    row.end_date }    : {}),
    ...(row.time        ? { time:       row.time }        : {}),
    ...(row.description ? { desc:       row.description } : {}),
    ...(row.color       ? { color:      row.color }       : {}),
    ...(row.recurrence  ? { recurrence: row.recurrence }  : {}),
  };
}

/** Flat DB rows array → events dict keyed by date */
export function rowsToDict(rows) {
  return rows.reduce((acc, row) => {
    const ev = dbToEvent(row);
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    // keep sorted by time
    acc[ev.date].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    return acc;
  }, {});
}

/** App expense object → DB row */
export function expenseToDb(ex) {
  return {
    id:         ex.id,
    name:       ex.name,
    amount:     ex.amount,
    currency:   ex.currency   || "USD",
    type:       ex.type       || "expense",
    date:       ex.date,
    category:   ex.category,
    bill_split: ex.billSplit  || null,
  };
}
