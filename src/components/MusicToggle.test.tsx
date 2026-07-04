// src/components/MusicToggle.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MusicToggle } from "./MusicToggle";

const EXTRA_CLASS_NAME = "music-toggle-test-class";

function renderMusicToggle(overrides: Partial<Parameters<typeof MusicToggle>[0]> = {}) {
  const onToggle = jest.fn();

  render(
    <MusicToggle
      muted={false}
      onToggle={onToggle}
      {...overrides}
    />,
  );

  return { onToggle };
}

describe("MusicToggle", () => {
  it("mostra rótulo visível e classe adicional no modo completo", async () => {
    const user = userEvent.setup();
    const { onToggle } = renderMusicToggle({ className: EXTRA_CLASS_NAME });

    const button = screen.getByRole("button", { name: "Música" });

    expect(button).toHaveTextContent("♫");
    expect(button).toHaveTextContent("Música");
    expect(button).toHaveClass(EXTRA_CLASS_NAME);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).not.toHaveAttribute("aria-label");

    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("usa rótulo acessível sem texto visível no modo ícone", () => {
    renderMusicToggle({ iconOnly: true, muted: true });

    const button = screen.getByRole("button", { name: "Sem música" });

    expect(button).toHaveTextContent("×");
    expect(button).not.toHaveTextContent("Sem música");
    expect(button).toHaveAttribute("aria-label", "Sem música");
    expect(button).toHaveAttribute("title", "Sem música");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
