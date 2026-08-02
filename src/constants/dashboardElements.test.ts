import { DASHBOARD_2D_ELEMENTS } from "./dashboardElements";

describe("dashboard 2D elements catalog", () => {
  it("tem ids exclusivos para cada card", () => {
    const ids = DASHBOARD_2D_ELEMENTS.map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("define caminho de sprite para todo elemento do tipo sprite", () => {
    for (const element of DASHBOARD_2D_ELEMENTS) {
      if (element.kind === "sprite") {
        expect(element.spritePath).toMatch(/^\/assets\/visual\//);
      }
    }
  });

  it("inclui bola, raquete, componentes eletrônicos, power-ups e controle da torreta", () => {
    const categories = new Set(
      DASHBOARD_2D_ELEMENTS.map((element) => element.category),
    );
    expect(categories).toEqual(
      new Set([
        "Bola",
        "Raquete",
        "Componente eletrônico",
        "Power-up",
        "Controle",
      ]),
    );
  });
});
