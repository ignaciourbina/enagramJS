import React, { useState, useEffect, useRef, useCallback } from "react";
import { MODULES, MODULE_LIST } from "./utils/curriculum.js";
import { SR_INTERVALS, getRetention, needsReview } from "./utils/spacedRepetition.js";
import { executeCode } from "./utils/codeExecutor.js";
import { DEFAULT_STATE, loadState, saveState } from "./utils/storage.js";
import NavBar from "./components/NavBar.jsx";
import StatCard from "./components/StatCard.jsx";
import XPPopup from "./components/XPPopup.jsx";

// ─── MAIN APP ───
export default function EngramApp() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [activeModule, setActiveModule] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [xpPopup, setXpPopup] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const editorRef = useRef(null);
  const [bootPhase, setBootPhase] = useState(0);

  // Load
  useEffect(() => {
    // In test environment, skip splash and set loaded/bootPhase immediately
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      // Synchronously set state for tests to avoid act warnings
      setState(DEFAULT_STATE);
      setLoaded(true);
      setBootPhase(3);
      return;
    }
    loadState().then(s => {
      setState(s);
      setLoaded(true);
      setTimeout(() => setBootPhase(1), 300);
      setTimeout(() => setBootPhase(2), 800);
      setTimeout(() => setBootPhase(3), 1200);
    });
  }, []);

  // Save on change
  useEffect(() => { if (loaded) saveState(state); }, [state, loaded]);

  // Check streak
  useEffect(() => {
    if (!loaded) return;
    const now = new Date();
    const last = state.lastCheckIn ? new Date(state.lastCheckIn) : null;
    if (last) {
      const daysDiff = Math.floor((now - last) / 86400000);
      if (daysDiff > 1) {
        setState(p => ({ ...p, streak: 0 }));
      }
    }
  }, [loaded]);

  // Build review queue
  useEffect(() => {
    if (!loaded) return;
    const queue = [];
    Object.entries(state.completed).forEach(([cid, data]) => {
      if (needsReview(data.lastReviewed, data.srIndex || 0)) {
        const [modId] = cid.split("/");
        const mod = MODULES[modId];
        if (mod) {
          const ch = mod.challenges.find(c => c.id === cid.split("/")[1]);
          if (ch) queue.push({ ...ch, modId, modTitle: mod.title });
        }
      }
    });
    setReviewQueue(queue);
  }, [state.completed, loaded]);

  const checkUnlocks = useCallback((newCompleted) => {
    const newUnlocked = [...(state.unlocked || ["variables"])];
    MODULE_LIST.forEach(mod => {
      if (newUnlocked.includes(mod.id)) return;
      const allPrereqsDone = mod.prereqs.every(pid => {
        const pm = MODULES[pid];
        return pm && pm.challenges.every(ch => newCompleted[`${pid}/${ch.id}`]);
      });
      if (allPrereqsDone && mod.prereqs.length > 0) newUnlocked.push(mod.id);
    });
    return newUnlocked;
  }, [state.unlocked]);

  const awardXP = useCallback((amount) => {
    // Variable reward: 20% chance of 2x multiplier
    const multiplier = Math.random() < 0.2 ? 2 : 1;
    const total = amount * multiplier;
    setXpPopup({ amount: total, multiplier, key: Date.now() });
    setTimeout(() => setXpPopup(null), 2000);
    return total;
  }, []);

  const runCode = useCallback(() => {
    if (!activeModule) return;
    const ch = activeModule.challenges[activeChallenge];
    const result = executeCode(code, ch.setup || "", ch.test);
    if (result.success) {
      const cid = `${activeModule.id}/${ch.id}`;
      const prev = state.completed[cid];
      const isFirstTime = !prev;
      const xpGain = awardXP(isFirstTime ? 50 : 10);
      const now = new Date().toISOString();
      const today = new Date().toDateString();
      const lastDay = state.lastCheckIn ? new Date(state.lastCheckIn).toDateString() : null;
      const newStreak = lastDay === today ? state.streak : (state.streak + 1);
      const newCompleted = {
        ...state.completed,
        [cid]: { score: 100, attempts: (prev?.attempts || 0) + 1, lastReviewed: now, srIndex: Math.min((prev?.srIndex || 0) + 1, SR_INTERVALS.length - 1) }
      };
      const newUnlocked = checkUnlocks(newCompleted);
      setState(p => ({
        ...p, xp: p.xp + xpGain, streak: newStreak, lastCheckIn: now,
        completed: newCompleted, unlocked: newUnlocked,
        totalCompleted: isFirstTime ? p.totalCompleted + 1 : p.totalCompleted,
        mastery: { ...p.mastery, [activeModule.id]: calcModuleMastery(activeModule, newCompleted) }
      }));
      setFeedback({ type: "success", msg: isFirstTime ? "Nailed it! Node complete." : "Reinforced!" });
    } else {
      const cid = `${activeModule.id}/${ch.id}`;
      setState(p => ({
        ...p, completed: { ...p.completed, [cid]: { ...p.completed[cid], attempts: ((p.completed[cid]?.attempts) || 0) + 1 } }
      }));
      setFeedback({ type: "error", msg: result.error || "Tests didn't pass. Check your logic." });
    }
  }, [activeModule, activeChallenge, code, state, awardXP, checkUnlocks]);

  function calcModuleMastery(mod, completed) {
    const done = mod.challenges.filter(c => completed[`${mod.id}/${c.id}`]).length;
    return done / mod.challenges.length;
  }

  function openChallenge(mod, idx = 0) {
    setActiveModule(mod);
    setActiveChallenge(idx);
    setCode("");
    setFeedback(null);
    setShowHint(false);
    setView("challenge");
  }

  function openReview() {
    if (reviewQueue.length === 0) return;
    setReviewIdx(0);
    setCode("");
    setFeedback(null);
    setShowHint(false);
    setView("review");
  }

  function nextChallenge() {
    if (!activeModule) return;
    if (activeChallenge < activeModule.challenges.length - 1) {
      setActiveChallenge(activeChallenge + 1);
      setCode("");
      setFeedback(null);
      setShowHint(false);
    } else {
      setView("map");
    }
  }

  const totalChallenges = MODULE_LIST.reduce((s, m) => s + m.challenges.length, 0);
  const pctComplete = Math.round((state.totalCompleted / totalChallenges) * 100);

  if (!loaded || bootPhase < 3) {
    return (
      <div style={{ background: "#0a0e1a", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: bootPhase >= 1 ? 1 : 0, transition: "opacity 0.5s", filter: `hue-rotate(${bootPhase * 20}deg)` }}>{"\uD83E\uDDE0"}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#06b6d4", letterSpacing: 6, opacity: bootPhase >= 1 ? 1 : 0, transition: "opacity 0.6s 0.2s" }}>ENGRAM.JS</div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 8, letterSpacing: 3, opacity: bootPhase >= 2 ? 1 : 0, transition: "opacity 0.5s" }}>INITIALIZING NEURAL PATHWAYS...</div>
        <div style={{ width: 200, height: 2, background: "#1e293b", marginTop: 24, borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #06b6d4, #8b5cf6)", width: `${bootPhase * 33}%`, transition: "width 0.8s ease-out" }} />
        </div>
      </div>
    );
  }

  // ─── CHALLENGE VIEW (distraction-free) ───
  if (view === "challenge" && activeModule) {
    const ch = activeModule.challenges[activeChallenge];
    const cid = `${activeModule.id}/${ch.id}`;
    const isDone = !!state.completed[cid]?.score;
    return (
      <div style={{ background: "#0a0e1a", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e2e8f0" }}>
        {xpPopup && <XPPopup {...xpPopup} />}
        {/* Minimal top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #1e293b" }}>
          <button onClick={() => setView("map")} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>{"\u2190"} Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#475569", fontSize: 11 }}>{activeModule.icon} {activeModule.title}</span>
            <span style={{ color: "#334155" }}>|</span>
            <span style={{ color: "#06b6d4", fontSize: 12, fontWeight: 600 }}>{activeChallenge + 1}/{activeModule.challenges.length}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {activeModule.challenges.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: state.completed[`${activeModule.id}/${activeModule.challenges[i].id}`]?.score ? "#06b6d4" : i === activeChallenge ? "#475569" : "#1e293b" }} />
            ))}
          </div>
        </div>
        {/* Challenge content */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{ch.title}</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{ch.prompt}</p>
          {ch.setup && (
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#64748b" }}>
              <span style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Setup (read-only)</span>
              <pre style={{ margin: "6px 0 0", color: "#94a3b8", whiteSpace: "pre-wrap" }}>{ch.setup}</pre>
            </div>
          )}
          {/* Editor */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ position: "absolute", top: 10, left: 14, color: "#334155", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", pointerEvents: "none", zIndex: 1 }}>YOUR CODE</div>
            <textarea
              ref={editorRef}
              value={code}
              onChange={e => { setCode(e.target.value); setFeedback(null); }}
              onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); const s = e.target.selectionStart; setCode(code.substring(0, s) + "  " + code.substring(e.target.selectionEnd)); setTimeout(() => { editorRef.current.selectionStart = editorRef.current.selectionEnd = s + 2; }, 0); } if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runCode(); } }}
              spellCheck={false}
              style={{ width: "100%", minHeight: 160, background: "#0f172a", border: `2px solid ${feedback?.type === "error" ? "#ef4444" : feedback?.type === "success" ? "#06b6d4" : "#1e293b"}`, borderRadius: 10, padding: "32px 16px 16px", color: "#e2e8f0", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 14, lineHeight: 1.7, resize: "vertical", outline: "none", transition: "border-color 0.3s", boxSizing: "border-box" }}
              placeholder="// Write your solution here..."
            />
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={runCode} style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5 }}>
              {"\u25B6"} Run {navigator.platform?.includes("Mac") ? "\u2318\u21B5" : "Ctrl+\u21B5"}
            </button>
            <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "10px 18px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {showHint ? "Hide Hint" : "\uD83D\uDCA1 Hint"}
            </button>
            {isDone && activeChallenge < activeModule.challenges.length - 1 && (
              <button onClick={nextChallenge} style={{ background: "none", border: "1px solid #06b6d4", color: "#06b6d4", padding: "10px 18px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>
                Next {"\u2192"}
              </button>
            )}
            {isDone && activeChallenge === activeModule.challenges.length - 1 && (
              <button onClick={() => setView("map")} style={{ background: "none", border: "1px solid #10b981", color: "#10b981", padding: "10px 18px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>
                {"\u2713"} Module Complete
              </button>
            )}
          </div>
          {/* Hint */}
          {showHint && (
            <div style={{ marginTop: 16, background: "#1e1b3a", border: "1px solid #4c1d95", borderRadius: 8, padding: "12px 16px", color: "#c4b5fd", fontSize: 13, lineHeight: 1.6 }}>
              {"\uD83D\uDCA1"} {ch.hint}
            </div>
          )}
          {/* Feedback */}
          {feedback && (
            <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 8, fontSize: 13, lineHeight: 1.5, background: feedback.type === "success" ? "#052e16" : "#2d0f0f", border: `1px solid ${feedback.type === "success" ? "#166534" : "#7f1d1d"}`, color: feedback.type === "success" ? "#86efac" : "#fca5a5" }}>
              {feedback.type === "success" ? "\u2705 " : "\u274C "}{feedback.msg}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── REVIEW VIEW ───
  if (view === "review" && reviewQueue.length > 0) {
    const item = reviewQueue[reviewIdx];
    if (!item) { setView("dashboard"); return null; }
    return (
      <div style={{ background: "#0a0e1a", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e2e8f0" }}>
        {xpPopup && <XPPopup {...xpPopup} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #1e293b" }}>
          <button onClick={() => setView("dashboard")} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>{"\u2190"} Exit Review</button>
          <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600 }}>{"\uD83D\uDD04"} DAILY REFRESH {"\u2014"} {reviewIdx + 1}/{reviewQueue.length}</span>
          <div />
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
          <div style={{ color: "#475569", fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>{item.modTitle}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Review: {item.title}</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{item.prompt}</p>
          {item.setup && (
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 12 }}>
              <pre style={{ margin: 0, color: "#94a3b8" }}>{item.setup}</pre>
            </div>
          )}
          <textarea value={code} onChange={e => { setCode(e.target.value); setFeedback(null); }}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleReviewRun(item); } }}
            spellCheck={false}
            style={{ width: "100%", minHeight: 140, background: "#0f172a", border: "2px solid #1e293b", borderRadius: 10, padding: "16px", color: "#e2e8f0", fontFamily: "inherit", fontSize: 14, lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            placeholder="// Recall and re-solve..."
          />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => handleReviewRun(item)} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{"\u25B6"} Run</button>
            <button onClick={() => setShowHint(!showHint)} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "10px 18px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{showHint ? "Hide" : "\uD83D\uDCA1 Hint"}</button>
          </div>
          {showHint && <div style={{ marginTop: 14, background: "#1e1b3a", border: "1px solid #4c1d95", borderRadius: 8, padding: "12px 16px", color: "#c4b5fd", fontSize: 13 }}>{"\uD83D\uDCA1"} {item.hint}</div>}
          {feedback && <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 8, fontSize: 13, background: feedback.type === "success" ? "#052e16" : "#2d0f0f", border: `1px solid ${feedback.type === "success" ? "#166534" : "#7f1d1d"}`, color: feedback.type === "success" ? "#86efac" : "#fca5a5" }}>{feedback.type === "success" ? "\u2705 " : "\u274C "}{feedback.msg}</div>}
        </div>
      </div>
    );
  }

  function handleReviewRun(item) {
    const result = executeCode(code, item.setup || "", item.test);
    if (result.success) {
      const cid = `${item.modId}/${item.id}`;
      const xpGain = awardXP(15);
      setState(p => ({
        ...p, xp: p.xp + xpGain, reviewsDone: p.reviewsDone + 1,
        completed: { ...p.completed, [cid]: { ...p.completed[cid], lastReviewed: new Date().toISOString(), srIndex: Math.min((p.completed[cid]?.srIndex || 0) + 1, SR_INTERVALS.length - 1) } }
      }));
      setFeedback({ type: "success", msg: "Memory reinforced! Engram strengthened." });
      setTimeout(() => {
        if (reviewIdx < reviewQueue.length - 1) {
          setReviewIdx(reviewIdx + 1);
          setCode("");
          setFeedback(null);
          setShowHint(false);
        } else {
          setView("dashboard");
        }
      }, 1500);
    } else {
      setFeedback({ type: "error", msg: result.error || "Not quite. Try again \u2014 recall strengthens memory!" });
    }
  }

  // ─── MAP VIEW ───
  if (view === "map") {
    const tiers = {};
    MODULE_LIST.forEach(m => { if (!tiers[m.tier]) tiers[m.tier] = []; tiers[m.tier].push(m); });
    return (
      <div style={{ background: "#0a0e1a", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e2e8f0" }}>
        <NavBar view={view} setView={setView} xp={state.xp} streak={state.streak} reviewCount={reviewQueue.length} />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>Knowledge Graph</h1>
          <p style={{ color: "#475569", fontSize: 12, marginBottom: 32 }}>Directed Acyclic Graph {"\u2014"} master prerequisites to unlock advanced topics</p>
          {Object.entries(tiers).sort(([a],[b]) => a - b).map(([tier, mods]) => (
            <div key={tier} style={{ marginBottom: 24 }}>
              <div style={{ color: "#334155", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>TIER {tier}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {mods.map(mod => {
                  const isUnlocked = state.unlocked?.includes(mod.id);
                  const done = mod.challenges.filter(c => state.completed[`${mod.id}/${c.id}`]?.score).length;
                  const total = mod.challenges.length;
                  const mastery = done / total;
                  const retention = mod.challenges.reduce((s, c) => {
                    const d = state.completed[`${mod.id}/${c.id}`];
                    return s + (d ? getRetention(d.lastReviewed, d.srIndex) : 0);
                  }, 0) / total;
                  return (
                    <button key={mod.id} onClick={() => isUnlocked && openChallenge(mod, done < total ? done : 0)}
                      style={{ flex: "1 1 200px", maxWidth: 260, background: isUnlocked ? "#111827" : "#080b14", border: `1px solid ${mastery === 1 ? "#166534" : isUnlocked ? "#1e293b" : "#0f172a"}`, borderRadius: 12, padding: "16px 18px", cursor: isUnlocked ? "pointer" : "not-allowed", opacity: isUnlocked ? 1 : 0.4, textAlign: "left", fontFamily: "inherit", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
                      {mastery === 1 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 22 }}>{mod.icon}</span>
                        <span style={{ fontSize: 10, color: mastery === 1 ? "#10b981" : "#475569" }}>{done}/{total}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isUnlocked ? "#f1f5f9" : "#475569", marginBottom: 4 }}>{mod.title}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>{mod.desc}</div>
                      {isUnlocked && (
                        <div style={{ display: "flex", gap: 3 }}>
                          {mod.challenges.map((c, i) => {
                            const d = state.completed[`${mod.id}/${c.id}`];
                            const ret = d ? getRetention(d.lastReviewed, d.srIndex) : 0;
                            return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: d ? `rgba(6,182,212,${0.3 + ret * 0.7})` : "#1e293b" }} />;
                          })}
                        </div>
                      )}
                      {!isUnlocked && <div style={{ fontSize: 10, color: "#475569" }}>{"\uD83D\uDD12"} Requires: {mod.prereqs.map(p => MODULES[p]?.title).join(", ")}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div style={{ background: "#0a0e1a", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e2e8f0" }}>
      {xpPopup && <XPPopup {...xpPopup} />}
      <NavBar view={view} setView={setView} xp={state.xp} streak={state.streak} reviewCount={reviewQueue.length} />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        {/* Hero stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard label="XP" value={state.xp.toLocaleString()} color="#06b6d4" icon={"\u26A1"} />
          <StatCard label="Streak" value={`${state.streak}d`} color="#f59e0b" icon={"\uD83D\uDD25"} />
          <StatCard label="Mastery" value={`${pctComplete}%`} color="#10b981" icon={"\uD83E\uDDE0"} />
          <StatCard label="Reviews" value={state.reviewsDone} color="#8b5cf6" icon={"\uD83D\uDD04"} />
        </div>

        {/* Review prompt */}
        {reviewQueue.length > 0 && (
          <button onClick={openReview} style={{ width: "100%", background: "linear-gradient(135deg, #1e1b3a, #172040)", border: "1px solid #f59e0b44", borderRadius: 12, padding: "18px 20px", marginBottom: 24, cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{"\uD83D\uDD04"} Daily Refresh Available</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>{reviewQueue.length} engram{reviewQueue.length !== 1 ? "s" : ""} fading {"\u2014"} reinforce them now</div>
            </div>
            <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, background: "#f59e0b22", padding: "6px 14px", borderRadius: 6 }}>Start {"\u2192"}</div>
          </button>
        )}

        {/* Knowledge Heatmap */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Knowledge Heatmap</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {MODULE_LIST.filter(m => state.unlocked?.includes(m.id)).map(mod => {
              const mastery = state.mastery?.[mod.id] || 0;
              const avgRetention = mod.challenges.reduce((s, c) => {
                const d = state.completed[`${mod.id}/${c.id}`];
                return s + (d ? getRetention(d.lastReviewed, d.srIndex) : 0);
              }, 0) / mod.challenges.length;
              const hue = avgRetention > 0.7 ? 180 : avgRetention > 0.4 ? 45 : 0;
              const sat = Math.round(40 + avgRetention * 60);
              const light = Math.round(15 + avgRetention * 10);
              return (
                <div key={mod.id} style={{ background: mastery > 0 ? `hsl(${hue}, ${sat}%, ${light}%)` : "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span>{mod.icon} {mod.title}</span>
                    <span style={{ color: "#94a3b8" }}>{Math.round(avgRetention * 100)}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {mod.challenges.map((c, i) => {
                      const d = state.completed[`${mod.id}/${c.id}`];
                      const r = d ? getRetention(d.lastReviewed, d.srIndex) : 0;
                      return <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: d ? `hsl(${r > 0.7 ? 180 : r > 0.4 ? 45 : 0}, ${Math.round(50 + r * 50)}%, ${Math.round(25 + r * 30)}%)` : "#1e293b" }} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick continue */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Continue Learning</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MODULE_LIST.filter(m => state.unlocked?.includes(m.id)).filter(m => {
            const done = m.challenges.filter(c => state.completed[`${m.id}/${c.id}`]?.score).length;
            return done < m.challenges.length;
          }).slice(0, 3).map(mod => {
            const done = mod.challenges.filter(c => state.completed[`${mod.id}/${c.id}`]?.score).length;
            return (
              <button key={mod.id} onClick={() => openChallenge(mod, done)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 18px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{mod.icon}</span>
                  <div>
                    <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{mod.title}</div>
                    <div style={{ color: "#475569", fontSize: 11 }}>Challenge {done + 1} of {mod.challenges.length}</div>
                  </div>
                </div>
                <span style={{ color: "#06b6d4", fontSize: 12 }}>Continue {"\u2192"}</span>
              </button>
            );
          })}
          {MODULE_LIST.filter(m => state.unlocked?.includes(m.id)).filter(m => {
            const done = m.challenges.filter(c => state.completed[`${m.id}/${c.id}`]?.score).length;
            return done < m.challenges.length;
          }).length === 0 && (
            <div style={{ color: "#475569", fontSize: 13, padding: 20, textAlign: "center" }}>All unlocked modules completed! Explore the map for locked content.</div>
          )}
        </div>

        {/* Reset button */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <button onClick={async () => { setState(DEFAULT_STATE); try { await window.storage.delete("engram-state"); } catch {} }} style={{ background: "none", border: "1px solid #1e293b", color: "#475569", padding: "8px 16px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Reset All Progress</button>
        </div>
      </div>
    </div>
  );
}

function NavBar({ view, setView, xp, streak, reviewCount }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #1e293b", background: "#0d1117", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setView("dashboard")}>
        <span style={{ fontSize: 20 }}>{"\uD83E\uDDE0"}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#06b6d4", letterSpacing: 2 }}>ENGRAM.JS</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[["dashboard", "\u25C9"], ["map", "\u25CE"]].map(([v, icon]) => (
          <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#1e293b" : "none", border: "none", color: view === v ? "#06b6d4" : "#475569", padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textTransform: "capitalize" }}>
            {icon} {v}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12 }}>
        {reviewCount > 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}>{"\uD83D\uDD04"} {reviewCount}</span>}
        <span style={{ color: "#f59e0b" }}>{"\uD83D\uDD25"} {streak}</span>
        <span style={{ color: "#06b6d4", fontWeight: 600 }}>{"\u26A1"} {xp.toLocaleString()}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ flex: "1 1 120px", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", minWidth: 100 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function XPPopup({ amount, multiplier }) {
  return (
    <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 1000, animation: "xpfloat 2s ease-out forwards", pointerEvents: "none" }}>
      <div style={{ background: multiplier > 1 ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff", padding: "10px 24px", borderRadius: 20, fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 4px 30px rgba(6,182,212,0.4)" }}>
        +{amount} XP {multiplier > 1 ? "\uD83C\uDFAF 2\u00D7 BONUS!" : ""}
      </div>
      <style>{`@keyframes xpfloat { 0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.8); } 15% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); } 30% { transform: translateX(-50%) translateY(0) scale(1); } 100% { opacity: 0; transform: translateX(-50%) translateY(-60px); } }`}</style>
    </div>
  );
}
