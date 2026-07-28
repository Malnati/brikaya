import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { getSeoMetadata } from "../../src/i18n/metadata";
import {
  getLocaleEligibility,
} from "../../src/i18n/localeEligibility";
import { SUPPORTED_LOCALES } from "../../src/i18n/messages";
import { DOWNLOADS_ROUTE_PATH, HOME_ROUTE_PATH } from "../../src/routes";

const OUTPUT_PATH = join(process.cwd(), "scripts/generated/i18n-home-seo.json");

describe("export i18n seo metadata", () => {
  it("writes SEO snapshot for generate-localized-seo.mjs", () => {
    const snapshot: Record<
      string,
      {
        playable: boolean;
        searchEdition: boolean;
        adsenseSupported: boolean;
        contentComplete: boolean;
        fallback: boolean;
        indexable: boolean;
        reason?: string;
        home: { title: string; description: string; ogDescription: string };
        downloads: { title: string; description: string; ogDescription: string };
      }
    > = {};

    for (const locale of SUPPORTED_LOCALES) {
      const home = getSeoMetadata(locale, HOME_ROUTE_PATH);
      const downloads = getSeoMetadata(locale, DOWNLOADS_ROUTE_PATH);
      const eligibility = getLocaleEligibility(locale);
      snapshot[locale] = {
        ...eligibility,
        home: {
          title: home.title,
          description: home.description,
          ogDescription: home.ogDescription,
        },
        downloads: {
          title: downloads.title,
          description: downloads.description,
          ogDescription: downloads.ogDescription,
        },
      };
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
    expect(Object.keys(snapshot).length).toBeGreaterThan(0);
    expect(snapshot.en.indexable).toBe(true);
    expect(snapshot["pt-BR"].indexable).toBe(true);
    expect(snapshot["es-419"].indexable).toBe(true);
    expect(snapshot["es-419"].contentComplete).toBe(true);
    expect(snapshot.ja.indexable).toBe(false);
  });
});
