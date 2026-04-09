import { useState, useEffect } from "react";
import { modalStyles } from "../utils/modalStyles";
import {
  getOrCreateCalendarToken,
  rotateCalendarToken,
  getWebcalUrl,
  getGoogleCalendarUrl,
  getOutlookUrl,
} from "../lib/calendarSync";

export default function SubscribeModal({ userId, onClose }) {
  const [token,    setToken]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [copied,   setCopied]   = useState(false);
  const [rotating, setRotating] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  useEffect(() => {
    getOrCreateCalendarToken(userId).then(({ token, error }) => {
      if (error) setError(error);
      else setToken(token);
      setLoading(false);
    });
  }, [userId]);

  const webcalUrl = token ? getWebcalUrl(token) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(webcalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRotate = async () => {
    setRotating(true);
    setConfirmRotate(false);
    const { token: newToken, error } = await rotateCalendarToken(userId);
    if (error) setError(error);
    else setToken(newToken);
    setRotating(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Subscribe to Calendar</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p style={styles.intro}>
          Add your schedule to Google Calendar, Outlook, or Apple Calendar.
          It stays in sync automatically — any events you add here will appear there.
        </p>

        {loading && <p style={styles.status}>Generating your link…</p>}
        {error   && <p style={styles.errorText}>Error: {error}</p>}

        {token && (
          <>
            {/* URL display + copy */}
            <label style={styles.label}>Your subscription URL</label>
            <div style={styles.urlRow}>
              <span style={styles.urlText}>{webcalUrl}</span>
              <button style={{ ...styles.copyBtn, background: copied ? "#5AA867" : "#E8654A" }} onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Quick-add buttons */}
            <div style={styles.appGrid}>
              <a href={getGoogleCalendarUrl(token)} target="_blank" rel="noreferrer" style={styles.appBtn}>
                <IconGoogle />
                <span>Google Calendar</span>
              </a>
              <a href={getOutlookUrl(token)} target="_blank" rel="noreferrer" style={styles.appBtn}>
                <IconOutlook />
                <span>Outlook</span>
              </a>
              <a href={webcalUrl} style={styles.appBtn}>
                <IconApple />
                <span>Apple Calendar</span>
              </a>
            </div>

            {/* Manual instructions */}
            <details style={styles.details}>
              <summary style={styles.summary}>Manual setup instructions</summary>
              <div style={styles.steps}>
                <p style={styles.stepHead}>Google Calendar</p>
                <ol style={styles.ol}>
                  <li>Open Google Calendar → Settings (⚙️) → <em>Add calendar</em> → <em>From URL</em></li>
                  <li>Paste the URL above and click <em>Add calendar</em></li>
                </ol>
                <p style={styles.stepHead}>Outlook</p>
                <ol style={styles.ol}>
                  <li>Go to Outlook Calendar → <em>Add calendar</em> → <em>Subscribe from web</em></li>
                  <li>Paste the URL above and click <em>Import</em></li>
                </ol>
                <p style={styles.stepHead}>Apple Calendar (macOS / iOS)</p>
                <ol style={styles.ol}>
                  <li>Click the <em>Apple Calendar</em> button above, or open Calendar → File → <em>New Calendar Subscription</em></li>
                  <li>Paste the URL and click <em>Subscribe</em></li>
                </ol>
              </div>
            </details>

            {/* Rotate token */}
            <div style={styles.rotateSection}>
              {confirmRotate ? (
                <div style={styles.rotateConfirm}>
                  <span style={styles.rotateWarn}>This will break all existing subscriptions. Continue?</span>
                  <button style={styles.rotateCancelBtn} onClick={() => setConfirmRotate(false)}>Cancel</button>
                  <button style={styles.rotateConfirmBtn} onClick={handleRotate} disabled={rotating}>
                    {rotating ? "Resetting…" : "Reset URL"}
                  </button>
                </div>
              ) : (
                <button style={styles.rotateLinkBtn} onClick={() => setConfirmRotate(true)}>
                  Reset subscription URL
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function IconOutlook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="14" height="16" rx="2" fill="#0078D4"/>
      <rect x="9" y="8" width="14" height="12" rx="2" fill="#50A0DC"/>
      <circle cx="8" cy="12" r="3" fill="white"/>
    </svg>
  );
}

function IconApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

const styles = {
  ...modalStyles,
  modal: {
    background: "#ffffff",
    borderRadius: 16, padding: 28,
    width: 480, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid #E8E0D0",
  },
  intro: { fontSize: 13, color: "#6B6780", margin: "0 0 20px", lineHeight: 1.6 },
  status: { fontSize: 13, color: "#9B97A8", textAlign: "center", padding: "20px 0" },
  errorText: { fontSize: 13, color: "#E8654A", margin: "0 0 12px" },
  urlRow: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#F9F6F1", border: "1px solid #E8E0D0",
    borderRadius: 10, padding: "10px 12px", marginBottom: 20,
  },
  urlText: {
    flex: 1, fontSize: 12, color: "#6B6780", fontFamily: "monospace",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  copyBtn: {
    flexShrink: 0, border: "none", color: "#fff",
    borderRadius: 6, padding: "5px 12px",
    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 0.2s",
  },
  appGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 },
  appBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    background: "#F9F6F1", border: "1px solid #E8E0D0", borderRadius: 12,
    padding: "16px 10px", textDecoration: "none", color: "#1a1a2e",
    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
  },
  details: { marginBottom: 20 },
  summary: { fontSize: 13, color: "#9B97A8", cursor: "pointer", userSelect: "none" },
  steps: { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 },
  stepHead: { fontSize: 12, fontWeight: 700, color: "#1a1a2e", margin: "0 0 2px" },
  ol: { fontSize: 12, color: "#6B6780", margin: "0 0 4px", paddingLeft: 18, lineHeight: 1.8 },
  rotateSection: { borderTop: "1px solid #F0EDE8", paddingTop: 16 },
  rotateLinkBtn: {
    background: "none", border: "none", fontSize: 12,
    color: "#9B97A8", cursor: "pointer", padding: 0, textDecoration: "underline",
  },
  rotateConfirm: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  rotateWarn: { fontSize: 12, color: "#E8654A", flex: 1 },
  rotateCancelBtn: {
    background: "none", border: "1px solid #E8E0D0", borderRadius: 6,
    fontSize: 11, fontWeight: 600, color: "#6B6780", padding: "4px 10px", cursor: "pointer",
  },
  rotateConfirmBtn: {
    background: "#E8654A", border: "none", borderRadius: 6,
    fontSize: 11, fontWeight: 600, color: "#fff", padding: "4px 10px", cursor: "pointer",
  },
};
