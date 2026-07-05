// src/components/GameCinematicOverlay.tsx
import { useEffect, useState } from "react";

import { CINEMATIC_MEDIA_LAYERS } from "../constants/cinematicMedia";
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import {
  GAME_VISUAL_ASSET_ROLES,
  resolveGameVisualAssetPath,
  type GameVisualAssetRole,
} from "../utils/visualAssetResolver";
import { useI18n } from "../i18n";

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

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
  imageSetId?: ImageSetId;
  boardRect?: GameCinematicBoardRect | null;
}

export interface GameCinematicBoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
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
const MEDIA_CLASS_NAME = `${BASE_CLASS_NAME}__media`;
const STAGE_CLASS_NAME = `${BASE_CLASS_NAME}__stage`;
const CONTENT_CLASS_NAME = `${BASE_CLASS_NAME}__content`;
const RIP_COMPOSITION_CLASS_NAME = `${BASE_CLASS_NAME}__composition`;
const COUNTDOWN_HALO_CLASS_NAME = `${BASE_CLASS_NAME}__countdown-halo`;
const MEDIA_ALT = "";
const MEDIA_LOADING = "lazy";
const MEDIA_DECODING = "async";
const STAGE_TEST_ID = "game-cinematic-stage";
const CONTENT_TEST_ID = "game-cinematic-content";
const COUNTDOWN_COMPOSITION_TEST_ID = "game-cinematic-countdown-composition";
const COUNTDOWN_HALO_TEST_ID = "game-cinematic-countdown-halo";
const COUNTDOWN_COUNT_TEST_ID = "game-cinematic-countdown-count";
const RIP_COMPOSITION_TEST_ID = "game-cinematic-rip-composition";
const VIEWPORT_TOP_INSET_PARAM = "qaViewportTopInset";
const VIEWPORT_BOTTOM_INSET_PARAM = "qaViewportBottomInset";
const VIEWPORT_LEFT_INSET_PARAM = "qaViewportLeftInset";
const VIEWPORT_RIGHT_INSET_PARAM = "qaViewportRightInset";
const RIP_BROWSER_CHROME_SAFE_BOTTOM_PX = 104;
const COUNTDOWN_BROWSER_CHROME_SAFE_BOTTOM_PX = 104;
const COUNTDOWN_LANDSCAPE_SAFE_TOP_MAX_PX = 236;
const COUNTDOWN_LANDSCAPE_SAFE_TOP_RATIO = 0.4;
const RIP_MIN_VISIBLE_VIEWPORT_SIZE_PX = 240;
const COUNTDOWN_MIN_VISIBLE_VIEWPORT_SIZE_PX = 0;
const VIEWPORT_MEASUREMENT_TOLERANCE_PX = 1;
const VISIBLE_VIEWPORT_LEFT_PROPERTY = "--game-cinematic-visible-left";
const VISIBLE_VIEWPORT_TOP_PROPERTY = "--game-cinematic-visible-top";
const VISIBLE_VIEWPORT_WIDTH_PROPERTY = "--game-cinematic-visible-width";
const VISIBLE_VIEWPORT_HEIGHT_PROPERTY = "--game-cinematic-visible-height";
const RIP_VIEWPORT_LEFT_PROPERTY = "--game-cinematic-rip-visible-left";
const RIP_VIEWPORT_TOP_PROPERTY = "--game-cinematic-rip-visible-top";
const RIP_VIEWPORT_WIDTH_PROPERTY = "--game-cinematic-rip-visible-width";
const RIP_VIEWPORT_HEIGHT_PROPERTY = "--game-cinematic-rip-visible-height";
const CINEMATIC_MEDIA_ROLES = {
  "countdown-circle": GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay,
  "countdown-spark": GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay,
  "level-up-twirl": GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay,
  "level-up-star": GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay,
  "rip-smoke": GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke,
} as const satisfies Record<string, GameVisualAssetRole>;

type RipViewportStyle = CSSProperties & Record<string, string>;
type UsableViewportStyle = CSSProperties & Record<string, string>;

const CENTERED_LAYER_STYLE: CSSProperties = {
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
};

function resolveCinematicMediaPath(
  media: (typeof CINEMATIC_MEDIA_LAYERS)[keyof typeof CINEMATIC_MEDIA_LAYERS][number],
  imageSetId: ImageSetId,
) {
  const role = CINEMATIC_MEDIA_ROLES[media.id];
  return role ? resolveGameVisualAssetPath(imageSetId, role) : media.src;
}

function renderMediaLayers(
  state: Exclude<GameCinematicOverlayState, null>,
  imageSetId: ImageSetId,
) {
  return CINEMATIC_MEDIA_LAYERS[state.type].map((media) => {
    const src = resolveCinematicMediaPath(media, imageSetId);

    return (
      <img
        key={media.id}
        className={`${MEDIA_CLASS_NAME} ${MEDIA_CLASS_NAME}--${media.id}`}
        data-cinematic-media={media.id}
        src={src}
        alt={MEDIA_ALT}
        loading={MEDIA_LOADING}
        decoding={MEDIA_DECODING}
        aria-hidden="true"
        draggable={false}
        style={CENTERED_LAYER_STYLE}
      />
    );
  });
}

function positiveNumber(value: string | null): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function isStandaloneDisplayMode(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    standaloneNavigator.standalone === true
  );
}

function shouldReserveMobileBrowserChrome(): boolean {
  return (
    window.matchMedia?.("(pointer: coarse) and (max-width: 600px)").matches ===
      true && !isStandaloneDisplayMode()
  );
}

function shouldReserveLandscapeBrowserChrome(): boolean {
  return (
    window.matchMedia?.(
      "(pointer: coarse) and (orientation: landscape) and (max-height: 600px)",
    ).matches === true && !isStandaloneDisplayMode()
  );
}

function visualViewportAlreadyExcludesBrowserChrome(
  visualViewport: VisualViewport | null | undefined,
  width: number,
  height: number,
  left: number,
  top: number,
): boolean {
  if (!visualViewport) return false;

  return (
    top > VIEWPORT_MEASUREMENT_TOLERANCE_PX ||
    left > VIEWPORT_MEASUREMENT_TOLERANCE_PX ||
    Math.abs(window.innerHeight - height) > VIEWPORT_MEASUREMENT_TOLERANCE_PX ||
    Math.abs(window.innerWidth - width) > VIEWPORT_MEASUREMENT_TOLERANCE_PX
  );
}

function countdownLandscapeTopInset(height: number): number {
  return Math.min(
    COUNTDOWN_LANDSCAPE_SAFE_TOP_MAX_PX,
    Math.round(height * COUNTDOWN_LANDSCAPE_SAFE_TOP_RATIO),
  );
}

interface UsableViewportStyleOptions {
  includeRipLegacyProperties?: boolean;
  reservePortraitBottomInset?: boolean;
  reserveLandscapeTopInset?: boolean;
  minVisibleSize: number;
}

function requestedInset(searchParams: URLSearchParams, name: string): number {
  return positiveNumber(searchParams.get(name));
}

function measuredUsableViewportStyle({
  includeRipLegacyProperties = false,
  reservePortraitBottomInset = false,
  reserveLandscapeTopInset = false,
  minVisibleSize,
}: UsableViewportStyleOptions): UsableViewportStyle {
  const visualViewport = window.visualViewport;
  const left = visualViewport?.offsetLeft || 0;
  const top = visualViewport?.offsetTop || 0;
  const width = visualViewport?.width || window.innerWidth;
  const height = visualViewport?.height || window.innerHeight;
  const searchParams = new URLSearchParams(window.location.search);
  const requestedTopInset = requestedInset(searchParams, VIEWPORT_TOP_INSET_PARAM);
  const requestedBottomInset = requestedInset(
    searchParams,
    VIEWPORT_BOTTOM_INSET_PARAM,
  );
  const requestedLeftInset = requestedInset(searchParams, VIEWPORT_LEFT_INSET_PARAM);
  const requestedRightInset = requestedInset(searchParams, VIEWPORT_RIGHT_INSET_PARAM);
  const visualViewportIsUsable = visualViewportAlreadyExcludesBrowserChrome(
    visualViewport,
    width,
    height,
    left,
    top,
  );
  const fallbackPortraitBottomInset =
    reservePortraitBottomInset &&
    !visualViewportIsUsable &&
    requestedBottomInset === 0 &&
    shouldReserveMobileBrowserChrome()
      ? COUNTDOWN_BROWSER_CHROME_SAFE_BOTTOM_PX
      : 0;
  const fallbackRipBottomInset =
    includeRipLegacyProperties &&
    !visualViewportIsUsable &&
    requestedBottomInset === 0 &&
    shouldReserveMobileBrowserChrome()
      ? RIP_BROWSER_CHROME_SAFE_BOTTOM_PX
      : 0;
  const fallbackLandscapeTopInset =
    reserveLandscapeTopInset &&
    !visualViewportIsUsable &&
    requestedTopInset === 0 &&
    shouldReserveLandscapeBrowserChrome()
      ? countdownLandscapeTopInset(height)
      : 0;
  const usableTop = top + Math.max(requestedTopInset, fallbackLandscapeTopInset);
  const usableLeft = left + requestedLeftInset;
  const usableWidth = Math.max(
    minVisibleSize,
    width - requestedLeftInset - requestedRightInset,
  );
  const bottomInset = Math.max(
    requestedBottomInset,
    fallbackPortraitBottomInset,
    fallbackRipBottomInset,
  );
  const visibleHeight = Math.max(
    minVisibleSize,
    height - (usableTop - top) - bottomInset,
  );
  const style: UsableViewportStyle = {
    left: `${usableLeft}px`,
    top: `${usableTop}px`,
    width: `${usableWidth}px`,
    height: `${visibleHeight}px`,
    [VISIBLE_VIEWPORT_LEFT_PROPERTY]: `${usableLeft}px`,
    [VISIBLE_VIEWPORT_TOP_PROPERTY]: `${usableTop}px`,
    [VISIBLE_VIEWPORT_WIDTH_PROPERTY]: `${usableWidth}px`,
    [VISIBLE_VIEWPORT_HEIGHT_PROPERTY]: `${visibleHeight}px`,
  };

  if (includeRipLegacyProperties) {
    style[RIP_VIEWPORT_LEFT_PROPERTY] = `${usableLeft}px`;
    style[RIP_VIEWPORT_TOP_PROPERTY] = `${usableTop}px`;
    style[RIP_VIEWPORT_WIDTH_PROPERTY] = `${usableWidth}px`;
    style[RIP_VIEWPORT_HEIGHT_PROPERTY] = `${visibleHeight}px`;
  }

  return style;
}

function useUsableViewportStyle(
  enabled: boolean,
  options: UsableViewportStyleOptions,
): UsableViewportStyle | undefined {
  const [style, setStyle] = useState<UsableViewportStyle | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setStyle(undefined);
      return undefined;
    }

    const updateStyle = () => setStyle(measuredUsableViewportStyle(options));

    updateStyle();
    window.addEventListener("resize", updateStyle);
    window.visualViewport?.addEventListener("resize", updateStyle);
    window.visualViewport?.addEventListener("scroll", updateStyle);

    return () => {
      window.removeEventListener("resize", updateStyle);
      window.visualViewport?.removeEventListener("resize", updateStyle);
      window.visualViewport?.removeEventListener("scroll", updateStyle);
    };
  }, [enabled]);

  return enabled ? style : undefined;
}

function useCountdownViewportStyle(enabled: boolean): UsableViewportStyle | undefined {
  return useUsableViewportStyle(enabled, {
    minVisibleSize: COUNTDOWN_MIN_VISIBLE_VIEWPORT_SIZE_PX,
    reserveLandscapeTopInset: true,
    reservePortraitBottomInset: true,
  });
}

function useRipViewportStyle(enabled: boolean): RipViewportStyle | undefined {
  return useUsableViewportStyle(enabled, {
    includeRipLegacyProperties: true,
    minVisibleSize: RIP_MIN_VISIBLE_VIEWPORT_SIZE_PX,
  });
}

function stageStyle(
  boardRect: GameCinematicBoardRect | null | undefined,
  customStyle?: CSSProperties,
): CSSProperties | undefined {
  if (!boardRect) return customStyle;

  return {
    ...customStyle,
    left: boardRect.x,
    top: boardRect.y,
    width: boardRect.width,
    height: boardRect.height,
  };
}

function renderStage(
  children: ReactNode,
  boardRect: GameCinematicBoardRect | null | undefined,
  customStyle?: CSSProperties,
) {
  return (
    <div
      className={STAGE_CLASS_NAME}
      data-testid={STAGE_TEST_ID}
      style={stageStyle(boardRect, customStyle)}
    >
      {children}
    </div>
  );
}

function renderContent(children: ReactNode) {
  return (
    <div className={CONTENT_CLASS_NAME} data-testid={CONTENT_TEST_ID}>
      {children}
    </div>
  );
}

function renderComposition(children: ReactNode, testId: string) {
  return (
    <div
      className={RIP_COMPOSITION_CLASS_NAME}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function renderCountdownComposition(children: ReactNode) {
  return renderComposition(children, COUNTDOWN_COMPOSITION_TEST_ID);
}

function renderCountdownHalo() {
  return (
    <span
      className={COUNTDOWN_HALO_CLASS_NAME}
      data-testid={COUNTDOWN_HALO_TEST_ID}
      aria-hidden="true"
      style={CENTERED_LAYER_STYLE}
    />
  );
}

function renderRipComposition(children: ReactNode) {
  return renderComposition(children, RIP_COMPOSITION_TEST_ID);
}

function overlayProps(
  state: Exclude<GameCinematicOverlayState, null>,
  labels: {
    countdown: string;
    levelUp: string;
    rip: string;
  },
): OverlayAttributes {
  if (state.type === "countdown") {
    return {
      className: COUNTDOWN_CLASS_NAME,
      "aria-label": labels.countdown,
      "data-cinematic-type": state.type,
      "data-testid": TEST_ID,
    };
  }

  if (state.type === "levelUp") {
    return {
      className: LEVEL_UP_CLASS_NAME,
      "aria-label": labels.levelUp,
      "data-cinematic-type": state.type,
      "data-testid": LEVEL_UP_TEST_ID,
    };
  }

  return {
    className: RIP_CLASS_NAME,
    "aria-label": labels.rip,
    "data-cinematic-type": state.type,
    "data-testid": TEST_ID,
  };
}

export function GameCinematicOverlay({
  state,
  imageSetId = IMAGE_SET_RETRO_DEFAULT,
  boardRect = null,
}: GameCinematicOverlayProps) {
  const { t } = useI18n();
  const countdownViewportStyle = useCountdownViewportStyle(
    state?.type === "countdown",
  );
  const ripViewportStyle = useRipViewportStyle(state?.type === "rip");
  const labels = {
    countdown: t("cinematic.countdownAria"),
    levelUp: t("cinematic.levelUpAria"),
    rip: t("cinematic.gameOverAria"),
  };

  if (!state) return null;

  if (state.type === "countdown") {
    return (
      <div {...overlayProps(state, labels)} role="status" aria-live="assertive">
        {renderStage(
          renderCountdownComposition(
            <>
              {renderCountdownHalo()}
              {renderMediaLayers(state, imageSetId)}
              {renderContent(
                <span
                  className={`${BASE_CLASS_NAME}__count`}
                  data-testid={COUNTDOWN_COUNT_TEST_ID}
                  style={CENTERED_LAYER_STYLE}
                >
                  {state.value}
                </span>,
              )}
            </>,
          ),
          null,
          countdownViewportStyle,
        )}
      </div>
    );
  }

  if (state.type === "levelUp") {
    return (
      <div {...overlayProps(state, labels)} role="status" aria-live="polite">
        {renderStage(
          <>
            {renderMediaLayers(state, imageSetId)}
            {renderContent(
              <>
                <span className={`${BASE_CLASS_NAME}__eyebrow`}>
                  {t("cinematic.levelUpEyebrow")}
                </span>
                <span className={`${BASE_CLASS_NAME}__title`}>
                  {t("cinematic.levelPrefix")} {state.nextLevel}
                </span>
                <span className={`${BASE_CLASS_NAME}__detail`}>
                  {t("cinematic.speedPrefix")} {state.speedLabel}
                </span>
              </>,
            )}
          </>,
          boardRect,
        )}
      </div>
    );
  }

  return (
    <div {...overlayProps(state, labels)} role="status" aria-live="assertive">
      {renderStage(
        renderRipComposition(
          <>
            {renderMediaLayers(state, imageSetId)}
            {renderContent(
              <>
                <span className={`${BASE_CLASS_NAME}__title`}>
                  {t("cinematic.ripTitle")}
                </span>
                <span className={`${BASE_CLASS_NAME}__detail`}>
                  {t("cinematic.ripHint")}
                </span>
              </>,
            )}
          </>,
        ),
        null,
        ripViewportStyle,
      )}
    </div>
  );
}
