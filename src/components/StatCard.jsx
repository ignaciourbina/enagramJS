export default function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ flex: "1 1 120px", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", minWidth: 100 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
