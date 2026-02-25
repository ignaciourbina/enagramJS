// Curriculum DAG and helpers
export const MODULES = {
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

export const MODULE_LIST = Object.values(MODULES);
export const TIER_COLORS = ["#06b6d4","#8b5cf6","#f59e0b","#ef4444","#10b981","#ec4899","#3b82f6"];
