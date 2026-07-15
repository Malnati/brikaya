// scripts/brikaya-ship.test.mjs
import assert from "node:assert/strict";

import { validateMinimum } from "./brikaya-ship.mjs";

const calls = [];

function createRunMock() {
  return (command, args) => {
    calls.push({ command, args: [...args] });
    if (command === "node" && args[0] === "--version") {
      return "v23.0.0";
    }
    return "";
  };
}

validateMinimum({
  argv: ["node", "scripts/brikaya-ship.mjs"],
  run: createRunMock(),
});

assert.ok(
  calls.some(
    (call) =>
      call.command === "npm" &&
      call.args[0] === "run" &&
      call.args[1] === "sync:package-version",
  ),
  "validateMinimum deve executar sync:package-version",
);

assert.ok(
  calls.some(
    (call) =>
      call.command === "npm" &&
      call.args[0] === "run" &&
      call.args[1] === "verify:package-version",
  ),
  "validateMinimum deve executar verify:package-version",
);

assert.ok(
  calls.some(
    (call) =>
      call.command === "npm" &&
      call.args[0] === "run" &&
      call.args[1] === "verify:build-version",
  ),
  "validateMinimum deve executar verify:build-version",
);

assert.ok(
  calls.some(
    (call) =>
      call.command === "npm" &&
      call.args[0] === "run" &&
      call.args[1] === "brikaya:scaffold-version-docs",
  ),
  "validateMinimum deve executar brikaya:scaffold-version-docs",
);

assert.ok(
  calls.some(
    (call) =>
      call.command === "npm" &&
      call.args[0] === "run" &&
      call.args[1] === "verify:version-docs",
  ),
  "validateMinimum deve executar verify:version-docs",
);

const skippedCalls = [];
validateMinimum({
  argv: ["node", "scripts/brikaya-ship.mjs", "--skip-validate"],
  run: (command, args) => {
    skippedCalls.push({ command, args: [...args] });
    return "";
  },
});

assert.equal(skippedCalls.length, 0, "--skip-validate deve pular validação mínima");

console.log("brikaya-ship ok");
