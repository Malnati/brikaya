import { readFileSync } from "node:fs";

const CSS_PATH = "src/styles/index.css";
const CSS_SOURCE = readFileSync(CSS_PATH, "utf8");

function ruleBody(selector: string): string {
  const start = CSS_SOURCE.indexOf(`${selector} {`);
  expect(start).toBeGreaterThanOrEqual(0);

  const bodyStart = CSS_SOURCE.indexOf("{", start);
  const bodyEnd = CSS_SOURCE.indexOf("}", bodyStart);
  expect(bodyStart).toBeGreaterThanOrEqual(0);
  expect(bodyEnd).toBeGreaterThan(bodyStart);

  return CSS_SOURCE.slice(bodyStart + 1, bodyEnd);
}

function numericProperty(body: string, propertyName: string): number {
  const match = new RegExp(`${propertyName}:\\s*([0-9]+)`).exec(body);
  expect(match).not.toBeNull();
  return Number(match?.[1]);
}

describe("turret switch half-moon shape contract", () => {
  it("usa perfil de meia-lua assimétrico em vez de cápsula simétrica", () => {
    const switchRule = ruleBody(".game-turret-switch");
    const leftRule = ruleBody(".game-turret-switch--left");
    const rightRule = ruleBody(".game-turret-switch--right");

    expect(switchRule).not.toContain("border-radius: 999px");
    expect(leftRule).toContain(
      "border-radius: 0 var(--bb-turret-switch-radius) var(--bb-turret-switch-radius) 0",
    );
    expect(rightRule).toContain(
      "border-radius: var(--bb-turret-switch-radius) 0 0 var(--bb-turret-switch-radius)",
    );
  });

  it("mantém altura e deslocamento do polegar acima do piso de QA", () => {
    const switchRule = ruleBody(".game-turret-switch");

    expect(numericProperty(switchRule, "height")).toBeGreaterThanOrEqual(240);
    expect(numericProperty(switchRule, "--bb-turret-switch-thumb-travel")).toBeGreaterThanOrEqual(
      76,
    );
  });
});
