import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, googleLogin } from "../api/auth";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const { saveToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const fn = isRegister ? register : login;
      const res = await fn(email, password);
      saveToken(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "48px 40px",
        borderRadius: 8,
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 32 }}>🧬</span>
          <h2 style={{ margin: "12px 0 4px", fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>
            {isRegister ? "Create Account" : "Sign In"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Bairu Lab Sample Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              id="email" name="email" type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block", width: "100%", padding: "10px 12px",
                border: "1px solid #ddd", borderRadius: 5, fontSize: 14,
                boxSizing: "border-box", outline: "none"
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>
              Password
            </label>
            <input
              id="password" name="password" type="password"
              autoComplete="current-password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                display: "block", width: "100%", padding: "10px 12px",
                border: "1px solid #ddd", borderRadius: 5, fontSize: 14,
                boxSizing: "border-box", outline: "none"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fcc",
              borderRadius: 5, padding: "10px 12px", marginBottom: 16,
              fontSize: 13, color: "#c0392b"
            }}>
              {error}
            </div>
          )}

          <button type="submit" style={{
            width: "100%", padding: "11px",
            background: "#1a1a2e", color: "white",
            border: "none", borderRadius: 5,
            fontSize: 15, fontWeight: 600, cursor: "pointer"
          }}>
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #eee" }} />

        <button onClick={googleLogin} style={{
          width: "100%", padding: "11px",
          background: "white", color: "#444",
          border: "1px solid #ddd", borderRadius: 5,
          fontSize: 14, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          <span>G</span> Continue with Google
        </button>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#888" }}>
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <span style={{ color: "#1a1a2e", cursor: "pointer", fontWeight: 500 }}
            onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Sign in" : "Register"}
          </span>
        </p>

        <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#bbb" }}>
          Admin?{" "}
          <a href="/admin" style={{ color: "#555" }}>Admin Login</a>
        </p>

        <p style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "#bbb" }}>
          <a href="/" style={{ color: "#bbb" }}>← Back to Welcome</a>
        </p>
      </div>
    </div>
  )
}