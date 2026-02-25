// Storage helpers
export const DEFAULT_STATE = {
  xp: 0, streak: 0, lastCheckIn: null, freezes: 1,
  completed: {}, mastery: {}, unlocked: ["variables"],
  totalCompleted: 0, reviewsDone: 0
};

export async function loadState() {
  try {
    const r = await window.storage.get("engram-state");
    return r ? JSON.parse(r.value) : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

export async function saveState(state) {
  try { await window.storage.set("engram-state", JSON.stringify(state)); } catch {}
}
