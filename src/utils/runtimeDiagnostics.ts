const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const DIAGNOSTICS_STORAGE_KEY = "brikaya:diagnostics";
const GAMEPLAY_TELEMETRY_STORAGE_KEY = "brikaya:gameplay-telemetry";
const DIAGNOSTICS_QUERY_PARAM = "diagnostics";
const DEBUG_LOGS_QUERY_PARAM = "debugLogs";
const GAMEPLAY_TELEMETRY_QUERY_PARAM = "gameplayTelemetry";

function isTruthy(value: string | null | undefined): boolean {
  return TRUE_VALUES.has(String(value ?? "").toLowerCase());
}

function readSearchParam(name: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function readLocalStorageFlag(name: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage?.getItem(name) ?? null;
  } catch {
    return null;
  }
}

export function isRuntimeDiagnosticsEnabled(): boolean {
  return (
    isTruthy(readSearchParam(DIAGNOSTICS_QUERY_PARAM)) ||
    isTruthy(readSearchParam(DEBUG_LOGS_QUERY_PARAM)) ||
    isTruthy(readLocalStorageFlag(DIAGNOSTICS_STORAGE_KEY))
  );
}

export function isGameplayTelemetryEnabled(): boolean {
  return (
    isRuntimeDiagnosticsEnabled() ||
    isTruthy(readSearchParam(GAMEPLAY_TELEMETRY_QUERY_PARAM)) ||
    isTruthy(readLocalStorageFlag(GAMEPLAY_TELEMETRY_STORAGE_KEY))
  );
}
