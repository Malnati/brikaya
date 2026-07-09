// src/components/ConsentScreen.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConsentScreen } from "./ConsentScreen";

const FORBIDDEN_TECHNICAL_COPY =
  /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA|CMP|AdSense|H5|adsbygoogle/i;

describe("ConsentScreen", () => {
  it("expõe contêiner rolável para telas mobile compactas", () => {
    render(<ConsentScreen onAccept={jest.fn()} />);

    const scrollContainer = screen.getByTestId("consent-screen");
    expect(scrollContainer).toHaveClass("consent-screen");
    expect(scrollContainer.querySelector(".consent-screen__scroller")).toBeTruthy();
  });

  it("mostra consentimento com texto de usuário e CTA de jogo", async () => {
    const onAccept = jest.fn();
    const user = userEvent.setup();

    render(<ConsentScreen onAccept={onAccept} />);

    expect(
      screen.getByRole("dialog", { name: "Antes de jogar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Antes de jogar")).toBeInTheDocument();
    expect(
      screen.getByText(
        /pontuação, recordes e preferências ficam neste aparelho/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/região aproximada.*sugerir o idioma/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "Usar região para sugerir idioma",
      }),
    ).not.toBeChecked();
    expect(
      screen.getByText(/anúncios podem aparecer apenas entre fases/i),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(FORBIDDEN_TECHNICAL_COPY);

    await user.click(screen.getByRole("button", { name: "Aceitar e jogar" }));

    expect(onAccept).toHaveBeenCalledWith(false);
  });

  it("envia escolha opcional de região quando usuário marca a opção", async () => {
    const onAccept = jest.fn();
    const user = userEvent.setup();

    render(<ConsentScreen onAccept={onAccept} />);

    await user.click(
      screen.getByRole("checkbox", {
        name: "Usar região para sugerir idioma",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Aceitar e jogar" }));

    expect(onAccept).toHaveBeenCalledWith(true);
  });
});
