export const modalStyles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, backdropFilter: "blur(4px)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#1a1a2e" },
  closeBtn: { background: "none", border: "none", color: "#9B97A8", fontSize: 18, cursor: "pointer" },
  tabs: {
    display: "flex", background: "#F5F0E8",
    borderRadius: 8, padding: 3, gap: 2,
  },
  tabBtn: {
    flex: 1, background: "transparent", color: "#8B8599", border: "none",
    borderRadius: 6, padding: "7px 0", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "background 0.15s, color 0.15s",
  },
  tabBtnActive: { background: "#ffffff", color: "#1a1a2e", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.8px",
    color: "#8B8599", marginBottom: 6,
  },
  input: {
    width: "100%", padding: "10px 14px",
    borderRadius: 10, border: "1px solid #E8E0D0",
    background: "#F9F6F1", color: "#1a1a2e",
    fontSize: 14, outline: "none", marginBottom: 12,
    boxSizing: "border-box",
  },
  colorRow: { display: "flex", gap: 8, marginBottom: 20, marginTop: 2 },
  colorDot: { width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", transition: "transform 0.15s" },
  saveBtn: {
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 8, padding: "8px 22px",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
};
