import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function pad(n: number) { return String(n).padStart(2, "0"); }

function escapeICS(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildICS(events: any[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scheduling App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:My Schedule",
    "X-WR-TIMEZONE:UTC",
  ];

  for (const ev of events) {
    const [y, mo, d] = ev.date.split("-").map(Number);
    const [hour, min] = (ev.time || "00:00").split(":").map(Number);
    const dtstart = `${y}${pad(mo)}${pad(d)}T${pad(hour)}${pad(min)}00Z`;

    let dtend: string;
    if (ev.end_date && ev.end_date !== ev.date) {
      const [ey, em, ed] = ev.end_date.split("-").map(Number);
      dtend = `${ey}${pad(em)}${pad(ed)}T${pad(hour)}${pad(min)}00Z`;
    } else {
      const endHour = (hour + 1) % 24;
      dtend = `${y}${pad(mo)}${pad(d)}T${pad(endHour)}${pad(min)}00Z`;
    }

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@scheduling-app`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}Z`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    if (ev.color) lines.push(`X-APPLE-CALENDAR-COLOR:${ev.color}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract token from path: /functions/v1/calendar/{token}
  const token = new URL(req.url).pathname.split("/").pop();

  if (!token) {
    return new Response("Not found", { status: 404 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve token → user_id
  const { data: tokenRow, error: tokenErr } = await supabase
    .from("calendar_tokens")
    .select("user_id")
    .eq("token", token)
    .single();

  if (tokenErr || !tokenRow) {
    return new Response("Not found", { status: 404 });
  }

  // Fetch all events for this user
  const { data: events, error: eventsErr } = await supabase
    .from("events")
    .select("id, title, date, end_date, time, description, color")
    .eq("user_id", tokenRow.user_id);

  if (eventsErr) {
    return new Response("Internal error", { status: 500 });
  }

  const ics = buildICS(events ?? []);

  return new Response(ics, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="my-schedule.ics"',
      "Cache-Control": "no-cache",
    },
  });
});
