export default function XPPopup({ amount, multiplier }) {
  return (
    <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 1000, animation: "xpfloat 2s ease-out forwards", pointerEvents: "none" }}>
      <div style={{ background: multiplier > 1 ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff", padding: "10px 24px", borderRadius: 20, fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 30px rgba(6,182,212,0.4)" }}>
        +{amount} XP {multiplier > 1 ? "\uD83C\uDFAF 2\u00D7 BONUS!" : ""}
      </div>
      <style>{`@keyframes xpfloat { 0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.8); } 15% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); } 30% { transform: translateX(-50%) translateY(0) scale(1); } 100% { opacity: 0; transform: translateX(-50%) translateY(-60px); } }`}</style>
    </div>
  );
}
