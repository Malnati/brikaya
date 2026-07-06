// src/components/AppearanceSelector.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppearanceSelector } from "./AppearanceSelector";

const FIXED_SELECTION = {
  themeId: "neon-arcade",
  themeMode: "manual",
  autoThemeSequence: [
    "neon-arcade",
    "crt-high-contrast",
    "pixel-sunset",
    "ocean-night",
    "jungle-laser",
    "amber-retro",
    "cosmic-ice",
    "electric-plum",
    "lime-graphite",
    "ruby-depth",
    "real-metro-night",
    "real-auto-garage",
    "real-bio-lab",
    "real-ancient-temple",
    "real-orbital-station",
  ],
  autoThemeIndex: 0,
  imageSetId: "retro-default",
  fontSetId: "arcade-ui",
} as const;

describe("AppearanceSelector", () => {
  it("mostra somente Arcade neon e Retrô padrão", async () => {
    const onVisualThemePresetChange = jest.fn();
    const onImageSetChange = jest.fn();

    render(
      <AppearanceSelector
        selection={FIXED_SELECTION}
        onVisualThemePresetChange={onVisualThemePresetChange}
        onImageSetChange={onImageSetChange}
      />,
    );

    expect(screen.getByText("Conjuntos prontos")).toBeInTheDocument();
    expect(screen.getByText("Imagens")).toBeInTheDocument();
    expect(screen.queryByText("Cores")).not.toBeInTheDocument();
    expect(screen.queryByText("Fonte")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Automático por fase" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arcade neon" })).toHaveAttribute(
      "data-appearance-option-id",
      "preset-neon-arcade",
    );
    expect(
      screen.getByRole("button", { name: "Retrô padrão" }),
    ).toHaveAttribute("data-appearance-option-id", "retro-default");
    expect(
      screen.queryByRole("button", { name: "Pôr do sol pixelado" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Alto contraste" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Arcade neon" }));
    await userEvent.click(screen.getByRole("button", { name: "Retrô padrão" }));

    expect(onVisualThemePresetChange).toHaveBeenCalledWith(
      "preset-neon-arcade",
    );
    expect(onImageSetChange).toHaveBeenCalledWith("retro-default");
  });

  it("marca padrão como ativo", () => {
    render(
      <AppearanceSelector
        selection={FIXED_SELECTION}
        onVisualThemePresetChange={jest.fn()}
        onImageSetChange={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Arcade neon" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Retrô padrão" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
