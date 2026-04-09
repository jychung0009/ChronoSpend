import { supabase } from "./supabase";
import { uid } from "../utils/dateHelpers";

/**
 * Returns the existing calendar token for the user, or creates one if it
 * doesn't exist yet. Stored in the `calendar_tokens` table.
 */
export async function getOrCreateCalendarToken(userId) {
  // Upsert with ignoreDuplicates so concurrent/double calls never throw a
  // unique-constraint error — existing rows are left untouched.
  await supabase
    .from("calendar_tokens")
    .upsert({ user_id: userId, token: uid() }, { onConflict: "user_id", ignoreDuplicates: true });

  // Always read back whatever token won (the original if it already existed).
  const { data, error } = await supabase
    .from("calendar_tokens")
    .select("token")
    .eq("user_id", userId)
    .single();

  if (error || !data?.token) return { token: null, error: error?.message ?? "Failed to get token" };
  return { token: data.token, error: null };
}

/**
 * Rotates the user's calendar token (invalidates the old subscription URL).
 */
export async function rotateCalendarToken(userId) {
  const token = uid();
  const { error } = await supabase
    .from("calendar_tokens")
    .upsert({ user_id: userId, token });

  if (error) return { token: null, error: error.message };
  return { token, error: null };
}

/** The HTTPS URL for the live ICS feed. */
export function getSubscriptionUrl(token) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  return `${base}/functions/v1/calendar/${token}`;
}

/** webcal:// variant — opens directly in desktop calendar apps. */
export function getWebcalUrl(token) {
  return getSubscriptionUrl(token).replace(/^https?:\/\//, "webcal://");
}

/** Deep link to subscribe in Google Calendar. */
export function getGoogleCalendarUrl(token) {
  const url = encodeURIComponent(getWebcalUrl(token));
  return `https://calendar.google.com/calendar/r?cid=${url}`;
}

/** Deep link to subscribe in Outlook Web. */
export function getOutlookUrl(token) {
  const url = encodeURIComponent(getSubscriptionUrl(token));
  return `https://outlook.live.com/calendar/0/addfromweb?url=${url}&name=My%20Schedule`;
}
