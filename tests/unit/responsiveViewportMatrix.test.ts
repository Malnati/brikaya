// tests/unit/responsiveViewportMatrix.test.ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MATRIX_PATH = "tests/e2e/responsiveViewportMatrix.json";
const REQUIRED_VIEWPORTS = [
  ["iphone-15-16-default", 393, 852, 3, true, true],
  ["iphone-15-16-default-landscape", 852, 393, 3, true, true],
  ["iphone-14-default", 390, 844, 3, true, true],
  ["iphone-14-default-landscape", 844, 390, 3, true, true],
  ["iphone-16e-default", 390, 844, 3, true, true],
  ["iphone-16e-default-landscape", 844, 390, 3, true, true],
  ["iphone-17-default", 402, 874, 3, true, true],
  ["iphone-17-default-landscape", 874, 402, 3, true, true],
  ["ipad-11-a16-air-default", 820, 1180, 2, true, true],
  ["ipad-11-a16-air-default-landscape", 1180, 820, 2, true, true],
  ["ipad-pro-11-m4-default", 834, 1210, 2, true, true],
  ["ipad-pro-11-m4-default-landscape", 1210, 834, 2, true, true],
  ["desktop-compact", 1366, 768, 1, false, false],
  ["desktop-laptop", 1440, 900, 1, false, false],
  ["desktop-fhd", 1920, 1080, 1, false, false],
] as const;
const UNIQUE_NAME_COUNT = REQUIRED_VIEWPORTS.length;
const REQUIRED_SCREENSHOT_ROLES = [
  "mobile-default",
  "tablet-default",
  "desktop-default",
  "landscape-default",
];

interface ResponsiveViewport {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  orientation: "portrait" | "landscape";
  priority: "gameplay" | "smoke";
  smokeOverlays: boolean;
  screenshotRole?: string;
}

function readMatrix(): { viewports: ResponsiveViewport[] } {
  return JSON.parse(readFileSync(resolve(MATRIX_PATH), "utf8"));
}

describe("responsive viewport matrix", () => {
  it("declara iPhone, iPad e desktop obrigatórios para QA publicado", () => {
    const matrix = readMatrix();
    const byName = new Map(matrix.viewports.map((viewport) => [viewport.name, viewport]));

    for (const [name, width, height, deviceScaleFactor, isMobile, hasTouch] of REQUIRED_VIEWPORTS) {
      expect(byName.get(name)).toMatchObject({
        width,
        height,
        deviceScaleFactor,
        isMobile,
        hasTouch,
      });
    }
  });

  it("mantém nomes únicos, foco em gameplay e papéis mínimos de evidência", () => {
    const matrix = readMatrix();
    const names = matrix.viewports.map((viewport) => viewport.name);
    const screenshotRoles = matrix.viewports
      .map((viewport) => viewport.screenshotRole)
      .filter(Boolean);

    expect(new Set(names).size).toBe(UNIQUE_NAME_COUNT);
    expect(matrix.viewports.every((viewport) => viewport.priority === "gameplay")).toBe(true);
    for (const screenshotRole of REQUIRED_SCREENSHOT_ROLES) {
      expect(screenshotRoles).toContain(screenshotRole);
    }
  });
});
