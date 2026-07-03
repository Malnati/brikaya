// src/components/ConsentScreen.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConsentScreen } from "./ConsentScreen";

const FORBIDDEN_TECHNICAL_COPY =
  /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA|CMP|AdSense|H5|adsbygoogle/i;

describe("ConsentScreen", () => {
  it("mostra consentimento com texto de usuário e CTA de jogo", async () => {
    const onAccept = jest.fn();
    const user = userEvent.setup();

    render(<ConsentScreen onAccept={onAccept} />);

    expect(
      screen.getByRole("dialog", { name: "Antes de jogar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Antes de jogar")).toBeInTheDocument();
    expect(
      screen.getByText(/pontuação, recordes e preferências ficam neste aparelho/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/esta versão não mostra anúncios reais/i),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(FORBIDDEN_TECHNICAL_COPY);

    await user.click(screen.getByRole("button", { name: "Aceitar e jogar" }));

    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
