import React from "react";
import { render, screen } from "@testing-library/react";

import App from "../../App";
import { I18nProvider } from "../../i18n";
import { DASHBOARD_2D_ROUTE_PATH, DASHBOARD_3D_ROUTE_PATH } from "../../routes";
import { BUILD_VERSION_LABEL } from "../../constants/buildVersion";
import { DASHBOARD_2D_ELEMENTS } from "../../constants/dashboardElements";

jest.mock("../../utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

function renderDashboard(path: string) {
  window.history.replaceState(null, "", path);
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );
}

function seedDashboardShellMetadata(path: string) {
  document.title = "Dashboard Brikaya — elementos 2D";

  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = `https://brikaya.com${path}`;
  document.head.appendChild(canonical);

  const robots = document.createElement("meta");
  robots.name = "robots";
  robots.content = "noindex,follow";
  document.head.appendChild(robots);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    document.head.innerHTML = "";
  });

  it("preserva URL e metadados noindex do shell após iniciar o React", () => {
    window.history.replaceState(null, "", DASHBOARD_2D_ROUTE_PATH);
    seedDashboardShellMetadata(DASHBOARD_2D_ROUTE_PATH);

    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    expect(window.location.pathname).toBe(DASHBOARD_2D_ROUTE_PATH);
    expect(document.title).toBe("Dashboard Brikaya — elementos 2D");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,follow",
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://brikaya.com${DASHBOARD_2D_ROUTE_PATH}`,
    );
  });

  it("renderiza um card por elemento exclusivo do jogo em /dashboard/2d/", () => {
    renderDashboard(DASHBOARD_2D_ROUTE_PATH);

    expect(
      screen.getByRole("heading", {
        name: "Dashboard de elementos 2D",
      }),
    ).toBeInTheDocument();

    for (const element of DASHBOARD_2D_ELEMENTS) {
      expect(
        screen.getByRole("heading", { name: element.title, level: 3 }),
      ).toBeInTheDocument();
    }
  });

  it("mostra a versão do build no header", () => {
    renderDashboard(DASHBOARD_2D_ROUTE_PATH);

    expect(
      screen.getByText(`Versão ${BUILD_VERSION_LABEL}`),
    ).toBeInTheDocument();
  });

  it("renderiza um placeholder para o dashboard 3D reservado a versões futuras", () => {
    renderDashboard(DASHBOARD_3D_ROUTE_PATH);

    expect(
      screen.getByRole("heading", {
        name: "Dashboard de elementos 3D",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ainda não há elementos 3D" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Bolinha" }),
    ).not.toBeInTheDocument();
  });

  it("alterna entre as abas 2D e 3D preservando a versão no header", () => {
    renderDashboard(DASHBOARD_2D_ROUTE_PATH);

    const tab3d = screen.getByRole("link", { name: "3D" });
    expect(tab3d).toHaveAttribute("href", DASHBOARD_3D_ROUTE_PATH);
    const tab2d = screen.getByRole("link", { name: "2D" });
    expect(tab2d).toHaveAttribute("aria-current", "page");
  });
});
