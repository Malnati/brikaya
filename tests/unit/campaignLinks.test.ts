// tests/unit/campaignLinks.test.ts
import {
  CAMPAIGN_URL_PRESETS,
  buildCampaignPresetUrls,
  buildCampaignUrl,
} from '../../src/marketing/campaignLinks';

const SPANISH_LOCALE = 'es-419';
const SPANISH_CANONICAL = 'https://brikaya.com/es-419/';
const EMPTY_PARAMETERS = {};
const GOOGLE_SOURCE_PARAMETER = 'utm_source=google';
const PAID_SEARCH_PARAMETER = 'utm_medium=paid-search';
const LATAM_CAMPAIGN_PARAMETER = 'utm_campaign=brikaya-p0-latam-test';
const CLEAN_CONTENT_PARAMETER = 'utm_content=copia-r-pida';
const SANITIZED_TERM_PARAMETER = 'utm_term=arcade-casual';
const UNSAFE_CONTENT = 'copia rápida!';
const UNSAFE_TERM = 'arcade casual';
const META_PRESET_ID = 'meta-latam-social';

function queryParams(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

describe('links de campanha do Brikaya', () => {
  it('gera URL canônica limpa quando não há parâmetros de campanha', () => {
    expect(buildCampaignUrl(SPANISH_LOCALE, EMPTY_PARAMETERS)).toBe(
      SPANISH_CANONICAL,
    );
  });

  it('gera links UTM sem alterar domínio ou rota localizada', () => {
    const url = buildCampaignUrl(SPANISH_LOCALE, {
      utm_source: 'google',
      utm_medium: 'paid-search',
      utm_campaign: 'brikaya-p0-latam-test',
      utm_content: UNSAFE_CONTENT,
      utm_term: UNSAFE_TERM,
    });

    expect(url.startsWith(`${SPANISH_CANONICAL}?`)).toBe(true);
    expect(url).toContain(GOOGLE_SOURCE_PARAMETER);
    expect(url).toContain(PAID_SEARCH_PARAMETER);
    expect(url).toContain(LATAM_CAMPAIGN_PARAMETER);
    expect(url).toContain(CLEAN_CONTENT_PARAMETER);
    expect(url).toContain(SANITIZED_TERM_PARAMETER);
  });

  it('mantém presets para todos os caminhos de impulsionamento planejados', () => {
    const urls = buildCampaignPresetUrls();

    expect(Object.keys(urls)).toHaveLength(CAMPAIGN_URL_PRESETS.length);
    expect(urls[META_PRESET_ID]).toBeTruthy();
    expect(queryParams(urls[META_PRESET_ID]).get('utm_source')).toBe('meta');
    expect(queryParams(urls[META_PRESET_ID]).get('utm_campaign')).toBe(
      'brikaya-p0-latam-test',
    );
  });
});
