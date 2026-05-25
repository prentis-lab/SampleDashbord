export default function Welcome() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: 600,
        width: "100%",
        textAlign: "center",
        color: "white"
      }}>
        {/* Logo / Icon */}
        <div style={{
          width: 80, height: 80,
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
          border: "2px solid rgba(255,255,255,0.2)"
        }}>
          <span style={{ fontSize: 36 }}>🧬</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 32, fontWeight: 700,
          margin: "0 0 8px",
          letterSpacing: "-0.5px"
        }}>
        	Prentis Lab
        </h1>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.5)",
          margin: "0 0 32px",
          textTransform: "uppercase",
          letterSpacing: 2
        }}>
          Sample Data Management System
        </p>

        {/* Divider */}
        <div style={{
          width: 60, height: 2,
          background: "rgba(255,255,255,0.2)",
          margin: "0 auto 32px"
        }} />

        {/* Description */}
        <p style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.8,
          margin: "0 0 12px",
          padding: "0 20px"
        }}>
          This platform is used by the Prentis Lab to collect, manage, and track genomic sequencing sample data and associated information.
        </p>
        <p style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.45)",
          margin: "0 0 48px"
        }}>
          Access is restricted to authorised personnel only.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/login" style={{
            padding: "14px 40px",
            background: "white",
            color: "#1a1a2e",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 0.3,
            transition: "opacity 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Log In
          </a>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 64,
          fontSize: 12,
          color: "rgba(255,255,255,0.25)"
        }}>
          Unauthorised access is prohibited. All activity is monitored and logged.
        </p>
      </div>
    </div>
  )
}
