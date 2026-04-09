import { uid, COLORS } from "./dateHelpers";

export function parseICS(text) {
  // Normalize line endings, then unfold continuation lines (RFC 5545)
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const unfolded = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }

  const events = [];
  let current = null;

  for (const line of unfolded) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") {
      current = {};
    } else if (trimmed === "END:VEVENT") {
      if (current?.summary && current?.dtstart) events.push(current);
      current = null;
    } else if (current !== null) {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx < 0) continue;
      // Strip params (e.g. DTSTART;TZID=America/New_York → DTSTART)
      const keyPart = trimmed.slice(0, colonIdx).split(";")[0].toUpperCase();
      const value = trimmed.slice(colonIdx + 1);
      if (keyPart === "SUMMARY")
        current.summary = value.replace(/\\,/g, ",").replace(/\\n/g, "\n").replace(/\\;/g, ";");
      if (keyPart === "DESCRIPTION")
        current.description = value.replace(/\\,/g, ",").replace(/\\n/g, "\n").replace(/\\;/g, ";");
      if (keyPart === "DTSTART") current.dtstart = value;
    }
  }

  return events;
}

function parseDTValue(dtValue) {
  // Handles: 20260403T090000Z, 20260403T090000, 20260403 (all-day)
  const cleaned = dtValue.replace("Z", "");
  const year = parseInt(cleaned.slice(0, 4));
  const month = parseInt(cleaned.slice(4, 6)) - 1; // 0-indexed
  const day = parseInt(cleaned.slice(6, 8));
  let hour = 0, minute = 0;
  if (cleaned.length > 8 && cleaned[8] === "T") {
    hour = parseInt(cleaned.slice(9, 11));
    minute = parseInt(cleaned.slice(11, 13));
  }
  return { year, month, day, hour, minute };
}

function pad(n) { return String(n).padStart(2, "0"); }
function escapeICS(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** App events dict → ICS string, optionally filtered to [fromKey, toKey] */
export function eventsToICS(eventsDict, fromKey = null, toKey = null) {
  const allEvents = Object.values(eventsDict).flat();
  const filtered = allEvents.filter((ev) => {
    if (fromKey && ev.date < fromKey) return false;
    if (toKey   && ev.date > toKey)   return false;
    return true;
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scheduling App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const ev of filtered) {
    const [y, mo, d] = ev.date.split("-").map(Number);
    const [hour, min] = (ev.time || "00:00").split(":").map(Number);
    const dtstart = `${y}${pad(mo)}${pad(d)}T${pad(hour)}${pad(min)}00`;

    let dtend;
    if (ev.endDate && ev.endDate !== ev.date) {
      const [ey, em, ed] = ev.endDate.split("-").map(Number);
      dtend = `${ey}${pad(em)}${pad(ed)}T${pad(hour)}${pad(min)}00`;
    } else {
      const endHour = (hour + 1) % 24;
      dtend = `${y}${pad(mo)}${pad(d)}T${pad(endHour)}${pad(min)}00`;
    }

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@scheduling-app`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.desc)  lines.push(`DESCRIPTION:${escapeICS(ev.desc)}`);
    if (ev.color) lines.push(`X-APPLE-CALENDAR-COLOR:${ev.color}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return { ics: lines.join("\r\n"), count: filtered.length, events: filtered };
}

export function icsEventsToAppEvents(icsEvents) {
  return icsEvents.map((ev, i) => {
    const { year, month, day, hour, minute } = parseDTValue(ev.dtstart);
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return {
      id: uid(),
      title: ev.summary,
      time,
      desc: ev.description || "",
      color: COLORS[i % COLORS.length],
      date,
    };
  });
}
