import assert from "assert";
import { escapeRegex, makeRegexFilter } from "../../src/utils/escapeRegex.js";

let passed = 0;
let failed = 0;

function runAssert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

console.log("── Regex Security (ReDoS) Tests ─────────────────────────────");

try {
  runAssert(escapeRegex(123) === "", "Non-string returns empty string");

  runAssert(
    escapeRegex(".*+?^${}()|[]\\") === "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\",
    "All metacharacters are properly escaped"
  );

  runAssert(
    escapeRegex("(a+)+$") === "\\(a\\+\\)\\+\\$",
    "Known ReDoS payload is safely escaped"
  );

  const filter = makeRegexFilter(" hello ");
  runAssert(filter.$regex === "hello", "makeRegexFilter trims input");
  runAssert(filter.$options === "i", "makeRegexFilter applies options");

  const unsafeFilter = makeRegexFilter("(a+)+$");
  const regexObj = new RegExp(unsafeFilter.$regex, unsafeFilter.$options);
  runAssert(
    regexObj.test("(a+)+$"),
    "Escaped filter matches literal string containing regex operators"
  );
  runAssert(
    !regexObj.test("aaaaa"),
    "Escaped filter does not evaluate regex operators"
  );
} catch (error) {
  console.error("  ❌  Test threw error", error);
  failed++;
}

console.log(`\n────────────────────────────────────────────────────────────`);
if (failed > 0) {
  console.error(`Final: ${passed} passed, ${failed} failed`);
  process.exit(1);
} else {
  console.log(`Final: ${passed} passed, 0 failed\n`);
  process.exit(0);
}
