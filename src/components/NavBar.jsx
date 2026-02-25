export default function NavBar({ view, setView, xp, streak, reviewCount }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #1e293b", background: "#0d1117", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setView("dashboard")}> 
        <span style={{ fontSize: 20 }}> {"\uD83E\uDDE0"} </span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#06b6d4", letterSpacing: 2 }}>ENGRAM.JS</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[ ["dashboard", "\u25C9"], ["map", "\u25CE"] ].map(([v, icon]) => (
          <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#1e293b" : "none", border: "none", color: view === v ? "#06b6d4" : "#475569", padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textTransform: "capitalize" }}>
            {icon} {v}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12 }}>
        {reviewCount > 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}> {"\uD83D\uDD04"} {reviewCount} </span>}
        <span style={{ color: "#f59e0b" }}> {"\uD83D\uDD25"} {streak} </span>
        <span style={{ color: "#06b6d4", fontWeight: 600 }}> {"\u26A1"} {xp.toLocaleString()} </span>
      </div>
    </div>
  );
}
