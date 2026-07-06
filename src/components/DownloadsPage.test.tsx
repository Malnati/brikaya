import React from "react";
import { render, screen, within } from "@testing-library/react";

import App from "../App";
import { I18nProvider, getSeoMetadata } from "../i18n";
import { DOWNLOADS_ROUTE_PATH } from "../routes";

jest.mock("../utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

function renderDownloadsPage(path = DOWNLOADS_ROUTE_PATH) {
  window.history.replaceState(null, "", path);
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  );
}

describe("DownloadsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    window.history.replaceState(null, "", DOWNLOADS_ROUTE_PATH);
  });

  it("renderiza central gratuita de instalação sem lojas pagas conhecidas", () => {
    renderDownloadsPage();

    expect(
      screen.getByRole("heading", { name: /baixar brikaya|download brikaya/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /jogar agora|play now/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/|^https:\/\/brikaya\.com\//),
    );
    expect(
      screen.getByRole("link", { name: /https:\/\/brikaya\.com\//i }),
    ).toHaveAttribute("href", "https://brikaya.com/");
    expect(screen.queryByText(/Chrome Web Store/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Google Play/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Apple App Store/i)).not.toBeInTheDocument();
  });

  it("mostra QRCode, imagens locais e compromissos sem cadastro", () => {
    renderDownloadsPage();

    expect(screen.getByAltText(/open Brikaya|abrir Brikaya/i)).toHaveAttribute(
      "src",
      "/assets/visual/ui/ui-downloads-qr-code.svg",
    );
    expect(screen.getByAltText(/tabuleiro neon|neon brikaya board/i)).toHaveAttribute(
      "src",
      "/assets/visual/ui/ui-downloads-arcade-preview.svg",
    );

    const promise = screen.getByRole("heading", {
      name: /continua grátis|stays free/i,
    }).closest("section");
    expect(promise).not.toBeNull();
    expect(within(promise as HTMLElement).getByText(/sem conta|no account/i)).toBeInTheDocument();
  });

  it("usa SEO canônico específico de downloads", () => {
    const metadata = getSeoMetadata("pt-BR", DOWNLOADS_ROUTE_PATH);

    expect(metadata.canonicalUrl).toBe("https://brikaya.com/downloads/");
    expect(metadata.title).toContain("Baixar Brikaya");
    expect(metadata.description).toContain("sem conta");
  });

  it("renderiza a página de downloads no idioma da rota localizada", () => {
    const localizedExpectations = [
      {
        path: "/zh-CN/downloads/",
        heading: "下载 Brikaya",
        promise: "Brikaya 保持免费",
      },
      {
        path: "/ja/downloads/",
        heading: "Brikayaをダウンロード",
        promise: "Brikayaは無料のまま",
      },
      {
        path: "/ko/downloads/",
        heading: "Brikaya 다운로드",
        promise: "Brikaya는 계속 무료입니다",
      },
      {
        path: "/hi-IN/downloads/",
        heading: "Brikaya डाउनलोड करें",
        promise: "Brikaya हमेशा मुफ़्त रहेगा",
      },
    ];

    for (const { path, heading, promise } of localizedExpectations) {
      const { unmount } = renderDownloadsPage(path);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: promise })).toBeInTheDocument();
      expect(screen.queryByText("Download Brikaya")).not.toBeInTheDocument();

      unmount();
    }
  });
});
