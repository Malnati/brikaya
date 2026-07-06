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

describe("turret joystick layering contract", () => {
  it("mantém o joystick acima da zona invisível de toque do campo", () => {
    const joystickRule = ruleBody(".game-turret-joystick");
    const paddleTouchZoneRule = ruleBody(".game-paddle-touch-zone");

    expect(joystickRule).toContain("position: relative");
    expect(numericProperty(joystickRule, "z-index")).toBeGreaterThan(
      numericProperty(paddleTouchZoneRule, "z-index"),
    );
  });
});
