// src/utils/localAppReset.ts
import { resetScores } from "../storage/score";
import { debugLogger } from "../storage/debugLogger";
import { gameLogger } from "../storage/gameLogger";
import { collisionTracker } from "./collisionTracker";

const DEFAULT_APP_PATH = "/";

interface ResetStorageWindow {
  localStorage: Storage;
  sessionStorage: Storage;
}

interface ResetRefreshWindow {
  location: Pick<Location, "replace">;
  navigator: Pick<Navigator, "serviceWorker">;
}

export interface LocalAppResetDependencies {
  windowRef?: ResetStorageWindow;
  resetScoreStore?: () => Promise<void>;
  clearGameEvents?: () => Promise<void>;
  clearCollisions?: () => Promise<void>;
  clearDebugLogs?: () => Promise<void>;
}

export interface LocalAppRefreshDependencies {
  windowRef?: ResetRefreshWindow;
}

function clearBrowserStorage(windowRef: ResetStorageWindow) {
  windowRef.localStorage.clear();
  windowRef.sessionStorage.clear();
}

export async function resetLocalAppState({
  windowRef = window,
  resetScoreStore = resetScores,
  clearGameEvents = () => gameLogger.clearAllEvents(),
  clearCollisions = () => collisionTracker.clearAllCollisions(),
  clearDebugLogs = () => debugLogger.clearAllLogs(),
}: LocalAppResetDependencies = {}): Promise<void> {
  clearBrowserStorage(windowRef);

  await resetScoreStore();
  await clearGameEvents();
  await clearCollisions();
  await clearDebugLogs();
}

export async function refreshAppAfterLocalReset({
  windowRef = window,
}: LocalAppRefreshDependencies = {}): Promise<void> {
  try {
    const registration = await windowRef.navigator.serviceWorker?.getRegistration();
    await registration?.update();
  } catch {
    return windowRef.location.replace(DEFAULT_APP_PATH);
  }

  windowRef.location.replace(DEFAULT_APP_PATH);
}
