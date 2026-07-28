import {
  getLocaleEligibility,
  isIndexablePublicRoute,
  isIndexableTrustRoute,
  SEARCH_EDITION_LOCALES,
} from '../../src/i18n/localeEligibility';
import { HOME_ROUTE_PATH } from '../../src/routes';

describe('locale eligibility', () => {
  it('keeps 284 playable locales while limiting search editions to en, pt-BR and es-419', () => {
    expect(SEARCH_EDITION_LOCALES).toEqual(['en', 'pt-BR', 'es-419']);

    expect(getLocaleEligibility('en')).toMatchObject({
      playable: true,
      searchEdition: true,
      adsenseSupported: true,
      contentComplete: true,
      fallback: false,
      indexable: true,
    });
    expect(getLocaleEligibility('pt-BR')).toMatchObject({
      playable: true,
      searchEdition: true,
      adsenseSupported: true,
      contentComplete: true,
      fallback: false,
      indexable: true,
    });
    expect(getLocaleEligibility('es-419')).toMatchObject({
      playable: true,
      searchEdition: true,
      adsenseSupported: true,
      contentComplete: true,
      fallback: false,
      indexable: true,
    });
    expect(getLocaleEligibility('ja')).toMatchObject({
      playable: true,
      searchEdition: false,
      adsenseSupported: false,
      contentComplete: false,
      fallback: true,
      indexable: false,
    });
  });

  it('activates all Spanish public and trust routes after the editorial edition is complete', () => {
    expect(isIndexablePublicRoute('es-419', HOME_ROUTE_PATH)).toBe(true);
    expect(isIndexableTrustRoute('es-419', '/privacy/')).toBe(true);
  });
});
