import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { getSeoMetadata } from "../../src/i18n/metadata";
import { SUPPORTED_LOCALES } from "../../src/i18n/messages";
import { DOWNLOADS_ROUTE_PATH, HOME_ROUTE_PATH } from "../../src/routes";

const OUTPUT_PATH = join(process.cwd(), "scripts/generated/i18n-home-seo.json");

describe("export i18n seo metadata", () => {
  it("writes SEO snapshot for generate-localized-seo.mjs", () => {
    const snapshot: Record<
      string,
      {
        home: { title: string; description: string; ogDescription: string };
        downloads: { title: string; description: string; ogDescription: string };
      }
    > = {};

    for (const locale of SUPPORTED_LOCALES) {
      const home = getSeoMetadata(locale, HOME_ROUTE_PATH);
      const downloads = getSeoMetadata(locale, DOWNLOADS_ROUTE_PATH);
      snapshot[locale] = {
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
  });
});
