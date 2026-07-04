// src/i18n/locationLocale.ts
import type { AppLocale } from "./messages";

const GEOLOCATION_PERMISSION_NAME = "geolocation" as PermissionName;
const LOCATION_TIMEOUT_MS = 1600;
const LOCATION_MAXIMUM_AGE_MS = 600000;
const LOCATION_ENABLE_HIGH_ACCURACY = false;
const LOCATION_TIMEOUT_FALLBACK_MS = 1800;
const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

interface LocaleBoundingBox {
  locale: AppLocale;
  minimumLatitude: number;
  maximumLatitude: number;
  minimumLongitude: number;
  maximumLongitude: number;
}

const BRAZIL_BOX: LocaleBoundingBox = {
  locale: "pt-BR",
  minimumLatitude: -34,
  maximumLatitude: 6,
  minimumLongitude: -74,
  maximumLongitude: -34,
};

const LOCALE_BOUNDING_BOXES: readonly LocaleBoundingBox[] = [
  BRAZIL_BOX,
  {
    locale: "en",
    minimumLatitude: 24,
    maximumLatitude: 72,
    minimumLongitude: -170,
    maximumLongitude: -52,
  },
  {
    locale: "en",
    minimumLatitude: 49,
    maximumLatitude: 61,
    minimumLongitude: -8,
    maximumLongitude: 2,
  },
  {
    locale: "en",
    minimumLatitude: -44,
    maximumLatitude: -10,
    minimumLongitude: 112,
    maximumLongitude: 154,
  },
  {
    locale: "en-IN",
    minimumLatitude: 6,
    maximumLatitude: 36,
    minimumLongitude: 68,
    maximumLongitude: 98,
  },
  {
    locale: "de",
    minimumLatitude: 47,
    maximumLatitude: 55,
    minimumLongitude: 5,
    maximumLongitude: 16,
  },
  {
    locale: "fr",
    minimumLatitude: 41,
    maximumLatitude: 52,
    minimumLongitude: -6,
    maximumLongitude: 10,
  },
  {
    locale: "it",
    minimumLatitude: 35,
    maximumLatitude: 48,
    minimumLongitude: 6,
    maximumLongitude: 19,
  },
  {
    locale: "ja",
    minimumLatitude: 24,
    maximumLatitude: 46,
    minimumLongitude: 122,
    maximumLongitude: 146,
  },
  {
    locale: "ko",
    minimumLatitude: 33,
    maximumLatitude: 39,
    minimumLongitude: 124,
    maximumLongitude: 132,
  },
  {
    locale: "id",
    minimumLatitude: -11,
    maximumLatitude: 6,
    minimumLongitude: 95,
    maximumLongitude: 142,
  },
  {
    locale: "vi",
    minimumLatitude: 8,
    maximumLatitude: 24,
    minimumLongitude: 102,
    maximumLongitude: 110,
  },
  {
    locale: "fil",
    minimumLatitude: 4,
    maximumLatitude: 22,
    minimumLongitude: 116,
    maximumLongitude: 127,
  },
  {
    locale: "th",
    minimumLatitude: 5,
    maximumLatitude: 21,
    minimumLongitude: 97,
    maximumLongitude: 106,
  },
  {
    locale: "zh-CN",
    minimumLatitude: 18,
    maximumLatitude: 54,
    minimumLongitude: 73,
    maximumLongitude: 135,
  },
  {
    locale: "es-419",
    minimumLatitude: -56,
    maximumLatitude: 33,
    minimumLongitude: -118,
    maximumLongitude: -34,
  },
];

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value);
}

function isCoordinateInRange(latitude: number, longitude: number): boolean {
  return (
    isFiniteCoordinate(latitude) &&
    isFiniteCoordinate(longitude) &&
    latitude >= LATITUDE_MIN &&
    latitude <= LATITUDE_MAX &&
    longitude >= LONGITUDE_MIN &&
    longitude <= LONGITUDE_MAX
  );
}

function containsCoordinate(
  box: LocaleBoundingBox,
  latitude: number,
  longitude: number,
): boolean {
  return (
    latitude >= box.minimumLatitude &&
    latitude <= box.maximumLatitude &&
    longitude >= box.minimumLongitude &&
    longitude <= box.maximumLongitude
  );
}

export function getLocaleFromCoordinates(
  latitude: number,
  longitude: number,
): AppLocale | null {
  if (!isCoordinateInRange(latitude, longitude)) return null;

  for (const box of LOCALE_BOUNDING_BOXES) {
    if (containsCoordinate(box, latitude, longitude)) return box.locale;
  }

  return null;
}

async function readGeolocationPermission(
  windowRef: Window,
): Promise<PermissionState | null> {
  const permissions = windowRef.navigator.permissions;
  if (!permissions?.query) return null;

  try {
    const status = await permissions.query({
      name: GEOLOCATION_PERMISSION_NAME,
    });
    return status.state;
  } catch {
    return null;
  }
}

function getCurrentPosition(
  windowRef: Window,
): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    const fallbackTimer = windowRef.setTimeout(
      () => resolve(null),
      LOCATION_TIMEOUT_FALLBACK_MS,
    );

    windowRef.navigator.geolocation.getCurrentPosition(
      (position) => {
        windowRef.clearTimeout(fallbackTimer);
        resolve(position);
      },
      () => {
        windowRef.clearTimeout(fallbackTimer);
        resolve(null);
      },
      {
        enableHighAccuracy: LOCATION_ENABLE_HIGH_ACCURACY,
        maximumAge: LOCATION_MAXIMUM_AGE_MS,
        timeout: LOCATION_TIMEOUT_MS,
      },
    );
  });
}

export async function requestLocaleFromDeviceLocation(
  windowRef: Window = window,
): Promise<AppLocale | null> {
  if (!windowRef.isSecureContext) return null;
  if (!windowRef.navigator.geolocation) return null;

  const permission = await readGeolocationPermission(windowRef);
  if (permission === "denied") return null;

  const position = await getCurrentPosition(windowRef);
  if (!position) return null;

  return getLocaleFromCoordinates(
    position.coords.latitude,
    position.coords.longitude,
  );
}
