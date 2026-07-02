// src/components/GameCinematicOverlay.tsx
import { CINEMATIC_MEDIA_LAYERS } from "../constants/cinematicMedia";

import type { ComponentPropsWithoutRef } from "react";

export type GameCinematicOverlayState =
  | {
      type: "countdown";
      value: string;
    }
  | {
      type: "levelUp";
      nextLevel: number;
      speedLabel: string;
    }
  | {
      type: "rip";
    }
  | null;

interface GameCinematicOverlayProps {
  state: GameCinematicOverlayState;
}

type OverlayAttributes = ComponentPropsWithoutRef<"div"> & {
  "data-cinematic-type": string;
  "data-testid": string;
};

const BASE_CLASS_NAME = "game-cinematic-overlay";
const COUNTDOWN_CLASS_NAME =
  "game-cinematic-overlay game-cinematic-overlay--countdown";
const LEVEL_UP_CLASS_NAME =
  "game-cinematic-overlay game-cinematic-overlay--level-up";
const RIP_CLASS_NAME = "game-cinematic-overlay game-cinematic-overlay--rip";
const TEST_ID = "game-cinematic-overlay";
const LEVEL_UP_TEST_ID = "level-toast";
const COUNTDOWN_ARIA_LABEL = "Contagem inicial";
const LEVEL_UP_ARIA_LABEL = "Subida de fase";
const RIP_ARIA_LABEL = "Fim de jogo";
const LEVEL_UP_EYEBROW = "Subindo de nível";
const LEVEL_UP_TITLE_PREFIX = "Fase";
const LEVEL_UP_SPEED_PREFIX = "Velocidade";
const RIP_TITLE = "RIP";
const RIP_HINT = "Recomeçando...";
const MEDIA_CLASS_NAME = `${BASE_CLASS_NAME}__media`;
const MEDIA_ALT = "";

function renderMediaLayers(state: Exclude<GameCinematicOverlayState, null>) {
  return CINEMATIC_MEDIA_LAYERS[state.type].map((media) => (
    <img
      key={media.id}
      className={`${MEDIA_CLASS_NAME} ${MEDIA_CLASS_NAME}--${media.id}`}
      data-cinematic-media={media.id}
      src={media.src}
      alt={MEDIA_ALT}
      aria-hidden="true"
      draggable={false}
    />
  ));
}

function overlayProps(
  state: Exclude<GameCinematicOverlayState, null>,
): OverlayAttributes {
  if (state.type === "countdown") {
    return {
      className: COUNTDOWN_CLASS_NAME,
      "aria-label": COUNTDOWN_ARIA_LABEL,
      "data-cinematic-type": state.type,
      "data-testid": TEST_ID,
    };
  }

  if (state.type === "levelUp") {
    return {
      className: LEVEL_UP_CLASS_NAME,
      "aria-label": LEVEL_UP_ARIA_LABEL,
      "data-cinematic-type": state.type,
      "data-testid": LEVEL_UP_TEST_ID,
    };
  }

  return {
    className: RIP_CLASS_NAME,
    "aria-label": RIP_ARIA_LABEL,
    "data-cinematic-type": state.type,
    "data-testid": TEST_ID,
  };
}

export function GameCinematicOverlay({ state }: GameCinematicOverlayProps) {
  if (!state) return null;

  if (state.type === "countdown") {
    return (
      <div {...overlayProps(state)} role="status" aria-live="assertive">
        {renderMediaLayers(state)}
        <span className={`${BASE_CLASS_NAME}__count`}>{state.value}</span>
      </div>
    );
  }

  if (state.type === "levelUp") {
    return (
      <div {...overlayProps(state)} role="status" aria-live="polite">
        {renderMediaLayers(state)}
        <span className={`${BASE_CLASS_NAME}__eyebrow`}>
          {LEVEL_UP_EYEBROW}
        </span>
        <span className={`${BASE_CLASS_NAME}__title`}>
          {LEVEL_UP_TITLE_PREFIX} {state.nextLevel}
        </span>
        <span className={`${BASE_CLASS_NAME}__detail`}>
          {LEVEL_UP_SPEED_PREFIX} {state.speedLabel}
        </span>
      </div>
    );
  }

  return (
    <div {...overlayProps(state)} role="status" aria-live="assertive">
      {renderMediaLayers(state)}
      <span className={`${BASE_CLASS_NAME}__title`}>{RIP_TITLE}</span>
      <span className={`${BASE_CLASS_NAME}__detail`}>{RIP_HINT}</span>
    </div>
  );
}
