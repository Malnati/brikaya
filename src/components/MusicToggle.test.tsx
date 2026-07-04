// src/components/MusicToggle.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { I18nProvider } from "../i18n";
import { MusicToggle } from "./MusicToggle";

import type { ComponentProps } from "react";

function renderMusicToggle(
  props: Partial<ComponentProps<typeof MusicToggle>> = {},
) {
  const onToggle = props.onToggle || jest.fn();

  render(
    <I18nProvider>
      <MusicToggle muted={false} onToggle={onToggle} {...props} />
    </I18nProvider>,
  );

  return { onToggle };
}

describe("MusicToggle", () => {
  it("mostra música ativa com texto quando não é somente ícone", async () => {
    const user = userEvent.setup();
    const { onToggle } = renderMusicToggle();

    const button = screen.getByRole("button", { name: "Music" });

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("♫");
    expect(button).toHaveTextContent("Music");

    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("mantém nome acessível no modo ícone pausado sem mostrar texto", () => {
    renderMusicToggle({ muted: true, iconOnly: true });

    const button = screen.getByRole("button", { name: "Music off" });

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("title", "Music off");
    expect(button).toHaveTextContent("×");
    expect(button).not.toHaveTextContent("Music off");
  });
});
