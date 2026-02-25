import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── CURRICULUM DAG ───
const MODULES = {
  variables: {
    id: "variables", title: "Variables & Types", icon: "\u26A1", prereqs: [], tier: 0,
    desc: "let, const, and primitive types",
    challenges: [
      { id: "var1", title: "Declare & Assign", prompt: "Create a variable called `greeting` using `const` and assign it the string \"hello world\".", test: "typeof greeting === 'string' && greeting === 'hello world'", hint: "Use: const greeting = \"hello world\";" },
      { id: "var2", title: "Type Check", prompt: "Create a variable `age` set to `25` and a variable `isStudent` set to `true`.", test: "age === 25 && typeof age === 'number' && isStudent === true && typeof isStudent === 'boolean'", hint: "Remember: numbers don't need quotes, booleans are true/false" },
      { id: "var3", title: "Template Literals", prompt: "Given `name` is already \"Ada\", create a variable `msg` using a template literal that equals \"Hello, Ada!\".", setup: 'const name = "Ada";', test: 'msg === "Hello, Ada!"', hint: "Use backticks: `Hello, ${name}!`" },
    ]
  },
  operators: {
    id: "operators", title: "Operators", icon: "\uD83D\uDD22", prereqs: ["variables"], tier: 1,
    desc: "Arithmetic, comparison, and logical operators",
    challenges: [
      { id: "op1", title: "Arithmetic", prompt: "Create `result` equal to 17 modulo 5.", test: "result === 2", hint: "The modulo operator is %" },
      { id: "op2", title: "Comparison", prompt: "Create `isEqual` that checks if `\"5\"` is strictly equal to `5` (use ===).", test: "isEqual === false", hint: "Strict equality checks both value AND type" },
      { id: "op3", title: "Logical", prompt: "Create `canDrive` that is true only if `age >= 16` AND `hasLicense` is true.", setup: "const age = 18; const hasLicense = true;", test: "canDrive === true", hint: "Use the && (AND) operator" },
    ]
  },
  conditionals: {
    id: "conditionals", title: "Conditionals", icon: "\uD83D\uDD00", prereqs: ["operators"], tier: 2,
    desc: "if/else, ternary, and switch",
    challenges: [
      { id: "cond1", title: "If/Else", prompt: "Write a function `classify(n)` that returns \"positive\", \"negative\", or \"zero\".", test: 'classify(5) === "positive" && classify(-3) === "negative" && classify(0) === "zero"', hint: "Use if/else if/else chain" },
      { id: "cond2", title: "Ternary", prompt: "Create `status` using a ternary: if `score >= 60` return \"pass\", else \"fail\".", setup: "const score = 75;", test: 'status === "pass"', hint: "syntax: condition ? valueIfTrue : valueIfFalse" },
      { id: "cond3", title: "Switch", prompt: "Write `dayType(day)` returning \"weekday\" or \"weekend\". Saturday and Sunday are weekends.", test: 'dayType("Monday") === "weekday" && dayType("Saturday") === "weekend" && dayType("Sunday") === "weekend"', hint: "Use switch with fall-through for Sat/Sun" },
    ]
  },
  loops: {
    id: "loops", title: "Loops", icon: "\uD83D\uDD01", prereqs: ["conditionals"], tier: 2,
    desc: "for, while, and iteration patterns",
    challenges: [
      { id: "loop1", title: "For Loop", prompt: "Write `sumTo(n)` that returns the sum of 1 to n.", test: "sumTo(5) === 15 && sumTo(10) === 55 && sumTo(1) === 1", hint: "Use a for loop accumulating into a sum variable" },
      { id: "loop2", title: "While Loop", prompt: "Write `countDigits(n)` returning how many digits a positive integer has.", test: "countDigits(42) === 2 && countDigits(1000) === 4 && countDigits(7) === 1", hint: "Divide by 10 in a while loop until n < 1" },
      { id: "loop3", title: "Break & Continue", prompt: "Write `firstEvenOver(arr, min)` returning the first even number greater than min, or -1.", test: "firstEvenOver([1,3,5,8,10],6) === 8 && firstEvenOver([1,3,5],2) === -1", hint: "Loop through arr, use continue to skip odd/small, break when found" },
    ]
  },
  functions: {
    id: "functions", title: "Functions", icon: "\u2699\uFE0F", prereqs: ["loops"], tier: 3,
    desc: "Declarations, arrows, and higher-order functions",
    challenges: [
      { id: "fn1", title: "Arrow Functions", prompt: "Write an arrow function `double` that takes a number and returns it doubled.", test: "double(5) === 10 && double(0) === 0 && double(-3) === -6", hint: "const double = (n) => n * 2;" },
      { id: "fn2", title: "Default Params", prompt: "Write `greet(name, greeting=\"Hello\")` returning `\"${greeting}, ${name}!\"`.", test: 'greet("Ada") === "Hello, Ada!" && greet("Ada","Hi") === "Hi, Ada!"', hint: "Set the default in the parameter list" },
      { id: "fn3", title: "Callbacks", prompt: "Write `applyTwice(fn, val)` that applies fn to val, then applies fn to that result.", test: "applyTwice(x => x + 1, 5) === 7 && applyTwice(x => x * 2, 3) === 12", hint: "return fn(fn(val))" },
    ]
  },
  arrays: {
    id: "arrays", title: "Arrays", icon: "\uD83D\uDCE6", prereqs: ["functions"], tier: 3,
    desc: "Array methods and transformations",
    challenges: [
      { id: "arr1", title: "Map", prompt: "Given `nums = [1,2,3,4]`, create `squared` containing each number squared.", setup: "const nums = [1,2,3,4];", test: "JSON.stringify(squared) === '[1,4,9,16]'", hint: "Use nums.map(n => n * n)" },
      { id: "arr2", title: "Filter", prompt: "Write `evens(arr)` returning only even numbers.", test: "JSON.stringify(evens([1,2,3,4,5,6])) === '[2,4,6]'", hint: "Use arr.filter(n => n % 2 === 0)" },
      { id: "arr3", title: "Reduce", prompt: "Write `product(arr)` returning the product of all numbers in the array.", test: "product([1,2,3,4]) === 24 && product([5,5]) === 25", hint: "Use arr.reduce((acc, n) => acc * n, 1)" },
    ]
  },
  objects: {
    id: "objects", title: "Objects", icon: "\uD83C\uDFD7\uFE0F", prereqs: ["arrays"], tier: 4,
    desc: "Object manipulation and destructuring",
    challenges: [
      { id: "obj1", title: "Destructuring", prompt: "Given `user`, use destructuring to create variables `name` and `age`.", setup: 'const user = { name: "Ada", age: 36, role: "dev" };', test: 'name === "Ada" && age === 36', hint: "const { name, age } = user;" },
      { id: "obj2", title: "Spread", prompt: "Create `merged` by merging `a` and `b`, with b's values taking priority.", setup: 'const a = {x:1,y:2}; const b = {y:3,z:4};', test: "merged.x===1 && merged.y===3 && merged.z===4", hint: "const merged = { ...a, ...b };" },
      { id: "obj3", title: "Object.entries", prompt: "Write `invert(obj)` that swaps keys and values.", test: 'JSON.stringify(invert({a:"1",b:"2"})) === JSON.stringify({"1":"a","2":"b"})', hint: "Use Object.entries then Object.fromEntries with map" },
    ]
  },
  scope: {
    id: "scope", title: "Scope & Closures", icon: "\uD83D\uDD12", prereqs: ["objects", "functions"], tier: 5,
    desc: "Lexical scope, closures, and the module pattern",
    challenges: [
      { id: "sc1", title: "Closure Counter", prompt: "Write `makeCounter()` returning a function that returns 1, then 2, then 3, etc.", test: "const c = makeCounter(); c() === 1 && c() === 2 && c() === 3", hint: "Use a variable in the outer function that the inner function increments" },
      { id: "sc2", title: "Private State", prompt: "Write `createWallet(initial)` returning {deposit(n), withdraw(n), balance()}.", test: "const w = createWallet(100); w.deposit(50); w.withdraw(30); w.balance() === 120", hint: "Keep a private variable; return an object with methods" },
      { id: "sc3", title: "IIFE", prompt: "Create `uniqueId` as an IIFE that returns a function generating \"id_1\", \"id_2\", etc.", test: 'uniqueId() === "id_1" && uniqueId() === "id_2"', hint: "const uniqueId = (() => { let n=0; return () => `id_${++n}`; })();" },
    ]
  },
  async: {
    id: "async", title: "Promises & Async", icon: "\u231B", prereqs: ["scope"], tier: 6,
    desc: "Promises, async/await, and error handling",
    challenges: [
      { id: "as1", title: "Promise Basics", prompt: "Write `delay(ms, val)` returning a Promise that resolves with val after ms milliseconds.", test: "delay(10,'ok') instanceof Promise", hint: "return new Promise(resolve => setTimeout(() => resolve(val), ms))" },
      { id: "as2", title: "Promise Chain", prompt: "Write `doubleAsync(n)` returning a Promise resolving to n*2.", test: "doubleAsync(5) instanceof Promise", hint: "return Promise.resolve(n * 2)" },
      { id: "as3", title: "Error Handling", prompt: "Write `safeDivide(a,b)` returning a Promise: resolves a/b, rejects with \"Division by zero\" if b is 0.", test: 'safeDivide(10,2) instanceof Promise && safeDivide(1,0) instanceof Promise', hint: "Check b===0, return Promise.reject(...) or Promise.resolve(...)" },
    ]
  },
};

const MODULE_LIST = Object.values(MODULES);
const TIER_COLORS = ["#06b6d4","#8b5cf6","#f59e0b","#ef4444","#10b981","#ec4899","#3b82f6"];

// ─── SPACED REPETITION INTERVALS (hours) ───
const SR_INTERVALS = [1, 8, 24, 72, 168, 336, 720]; // 1h, 8h, 1d, 3d, 7d, 14d, 30d

function getRetention(lastReviewed, intervalIndex) {
  if (!lastReviewed) return 0;
  const elapsed = (Date.now() - new Date(lastReviewed).getTime()) / 3600000;
  const interval = SR_INTERVALS[Math.min(intervalIndex || 0, SR_INTERVALS.length - 1)];
  return Math.max(0, Math.min(1, 1 - (elapsed / (interval * 2.5))));
}

function needsReview(lastReviewed, intervalIndex) {
  if (!lastReviewed) return false;
  const elapsed = (Date.now() - new Date(lastReviewed).getTime()) / 3600000;
  return elapsed > SR_INTERVALS[Math.min(intervalIndex || 0, SR_INTERVALS.length - 1)];
}

// ─── CODE EXECUTOR (sandboxed) ───
function executeCode(code, setup = "", testCode) {
  try {
    const fullCode = `
      ${setup}
      ${code}
      ;(function(){ return !!(${testCode}); })();
    `;
    const fn = new Function(fullCode);
    const result = fn();
    return { success: !!result, error: null };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── STORAGE HELPERS ───
const DEFAULT_STATE = {
  xp: 0, streak: 0, lastCheckIn: null, freezes: 1,
  completed: {}, mastery: {}, unlocked: ["variables"],
  totalCompleted: 0, reviewsDone: 0
};

async function loadState() {
  try {
    const r = await window.storage.get("engram-state");
    return r ? JSON.parse(r.value) : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

async function saveState(state) {
  try { await window.storage.set("engram-state", JSON.stringify(state)); } catch {}
}

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
