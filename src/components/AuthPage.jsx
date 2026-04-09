import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [mode,     setMode]     = useState("signin"); // "signin" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email.trim() || !password)  { setError("Please enter your email and password."); return; }
    if (password.length < 6)         { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
      if (err) setError(err.message);
      else setInfo("Check your email for a confirmation link, then sign in.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(err.message);
      // on success App.jsx auth listener picks up the session automatically
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(""); setInfo("");
  };

  return (
    <div style={st.root}>
      <div style={st.card}>
        {/* Brand */}
        <div style={st.brand}>
          <div style={st.logo}>ChronoSpend</div>
          <div style={st.tagline}>SCHEDULE · SPEND · SIMPLIFY</div>
        </div>

        <h2 style={st.heading}>
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </h2>
        <p style={st.sub}>
          {mode === "signin"
            ? "Sign in to access your schedule and expenses."
            : "Sign up to start tracking your schedule and expenses."}
        </p>

        <form onSubmit={handleSubmit} style={st.form}>
          <div style={st.field}>
            <label style={st.label}>Email</label>
            <input
              style={st.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoComplete="email"
            />
          </div>

          <div style={st.field}>
            <label style={st.label}>Password</label>
            <input
              style={st.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div style={st.error}>{error}</div>}
          {info  && <div style={st.info}>{info}</div>}

          <button type="submit" style={{ ...st.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={st.toggle}>
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
          {" "}
          <button style={st.toggleBtn} onClick={switchMode}>
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

const st = {
  root: {
    minHeight: "100vh",
    background: "#F5F0E8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #E8E0D0",
    borderRadius: 20,
    padding: "40px 44px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  brand: { marginBottom: 28, textAlign: "center" },
  logo: {
    fontSize: 24, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.5px",
  },
  tagline: {
    fontSize: 9, fontWeight: 700, color: "#9B97A8",
    letterSpacing: "1.2px", marginTop: 4,
  },
  heading: {
    fontSize: 22, fontWeight: 700, color: "#1a1a2e",
    margin: "0 0 6px", letterSpacing: "-0.3px",
  },
  sub: { fontSize: 13, color: "#9B97A8", margin: "0 0 24px" },
  form:  { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: "#6B6780", letterSpacing: "0.4px" },
  input: {
    border: "1px solid #E8E0D0", borderRadius: 10,
    padding: "10px 14px", fontSize: 14, color: "#1a1a2e",
    outline: "none", background: "#FAFAF8",
    fontFamily: "inherit", transition: "border-color 0.15s",
  },
  error: {
    fontSize: 13, color: "#C0392B",
    background: "#FEF0EE", border: "1px solid #F5C6C0",
    borderRadius: 8, padding: "10px 14px",
  },
  info: {
    fontSize: 13, color: "#2E7D32",
    background: "#F0FFF4", border: "1px solid #A8D5B0",
    borderRadius: 8, padding: "10px 14px",
  },
  btn: {
    background: "#E8654A", border: "none", color: "#fff",
    borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.15s", marginTop: 4,
  },
  toggle:    { textAlign: "center", fontSize: 13, color: "#9B97A8", margin: "20px 0 0" },
  toggleBtn: {
    background: "none", border: "none", color: "#E8654A",
    fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0,
    fontFamily: "inherit",
  },
};
