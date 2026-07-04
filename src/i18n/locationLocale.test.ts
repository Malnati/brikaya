// src/i18n/locationLocale.test.ts
import type { AppLocale } from "./messages";
import {
  getLocaleFromCoordinates,
  requestLocaleFromDeviceLocation,
} from "./locationLocale";

const SAO_PAULO_COORDINATE = {
  latitude: -23.5505,
  longitude: -46.6333,
  locale: "pt-BR" as AppLocale,
};
const MEXICO_CITY_COORDINATE = {
  latitude: 19.4326,
  longitude: -99.1332,
  locale: "es-419" as AppLocale,
};
const LONDON_COORDINATE = {
  latitude: 51.5072,
  longitude: -0.1276,
  locale: "en" as AppLocale,
};
const TOKYO_COORDINATE = {
  latitude: 35.6762,
  longitude: 139.6503,
  locale: "ja" as AppLocale,
};
const INVALID_LATITUDE = 120;
const VALID_LONGITUDE = 10;
const GEOLOCATION_PERMISSION_NAME = "geolocation";

interface MockWindowOptions {
  secure?: boolean;
  permission?: PermissionState | null;
  latitude?: number;
  longitude?: number;
}

function createGeolocationWindowMock({
  secure = true,
  permission = "granted",
  latitude = SAO_PAULO_COORDINATE.latitude,
  longitude = SAO_PAULO_COORDINATE.longitude,
}: MockWindowOptions = {}): Window {
  const geolocation = {
    getCurrentPosition: jest.fn((success: PositionCallback) =>
      success({
        coords: { latitude, longitude },
      } as GeolocationPosition),
    ),
  };
  const permissions =
    permission === null
      ? undefined
      : {
          query: jest.fn(() => Promise.resolve({ state: permission })),
        };

  return {
    isSecureContext: secure,
    navigator: {
      geolocation,
      permissions,
    },
    setTimeout,
    clearTimeout,
  } as unknown as Window;
}

describe("locationLocale", () => {
  it.each([
    SAO_PAULO_COORDINATE,
    MEXICO_CITY_COORDINATE,
    LONDON_COORDINATE,
    TOKYO_COORDINATE,
  ])("mapeia coordenadas aproximadas para $locale", (coordinate) => {
    expect(
      getLocaleFromCoordinates(coordinate.latitude, coordinate.longitude),
    ).toBe(coordinate.locale);
  });

  it("ignora coordenadas inválidas", () => {
    expect(
      getLocaleFromCoordinates(INVALID_LATITUDE, VALID_LONGITUDE),
    ).toBeNull();
  });

  it("usa Geolocation API somente em contexto seguro e permissão disponível", async () => {
    const windowRef = createGeolocationWindowMock();

    await expect(requestLocaleFromDeviceLocation(windowRef)).resolves.toBe(
      SAO_PAULO_COORDINATE.locale,
    );
    expect(windowRef.navigator.permissions.query).toHaveBeenCalledWith({
      name: GEOLOCATION_PERMISSION_NAME,
    });
    expect(
      windowRef.navigator.geolocation.getCurrentPosition,
    ).toHaveBeenCalled();
  });

  it("cai sem localização quando permissão do navegador está negada", async () => {
    const windowRef = createGeolocationWindowMock({ permission: "denied" });

    await expect(
      requestLocaleFromDeviceLocation(windowRef),
    ).resolves.toBeNull();
    expect(
      windowRef.navigator.geolocation.getCurrentPosition,
    ).not.toHaveBeenCalled();
  });

  it("cai sem localização fora de contexto seguro", async () => {
    const windowRef = createGeolocationWindowMock({ secure: false });

    await expect(
      requestLocaleFromDeviceLocation(windowRef),
    ).resolves.toBeNull();
    expect(
      windowRef.navigator.geolocation.getCurrentPosition,
    ).not.toHaveBeenCalled();
  });
});
