// Sandboxed code executor
export function executeCode(code, setup = "", testCode) {
  try {
    // Evaluate all code in the same scope so variables are accessible
    const fullCode = `\n      ${setup}\n      ${code}\n      return !!(${testCode});\n    `;
    const fn = new Function(fullCode);
    const result = fn();
    return { success: !!result, error: null };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
