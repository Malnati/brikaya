import {
  ABOUT_ROUTE_PATH,
  DOWNLOADS_ROUTE_PATH,
  FAQ_ROUTE_PATH,
  HOW_TO_PLAY_ROUTE_PATH,
  LEGAL_ROUTE_PATH,
  PRIVACY_ROUTE_PATH,
  TERMS_ROUTE_PATH,
  getLocalizedEditorialPath,
  getLocalizedLegalPath,
  type PublicRoutePath,
} from "../routes";
import {
  getLocalizedRoutePath,
  getLocalePath,
  useI18n,
  type TranslationKey,
} from "../i18n";

const BRIKAYA_PUBLIC_URL = "https://brikaya.com/play/";
const DOWNLOADS_QR_IMAGE = "/assets/visual/ui/ui-downloads-qr-code.svg";
const DOWNLOADS_HERO_IMAGE = "/assets/visual/ui/ui-downloads-arcade-preview.svg";

interface DownloadOption {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  statusKey: TranslationKey;
  imagePath: string;
  imageAltKey: TranslationKey;
  href: string;
}

interface DownloadStep {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

interface PromiseItem {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const DOWNLOAD_OPTIONS: DownloadOption[] = [
  {
    titleKey: "downloads.option.web.title",
    bodyKey: "downloads.option.web.body",
    statusKey: "downloads.option.ready",
    imagePath: "/assets/visual/ui/ui-downloads-play-web.svg",
    imageAltKey: "downloads.option.web.alt",
    href: BRIKAYA_PUBLIC_URL,
  },
  {
    titleKey: "downloads.option.browser.title",
    bodyKey: "downloads.option.browser.body",
    statusKey: "downloads.option.ready",
    imagePath: "/assets/visual/ui/ui-downloads-install-browser.svg",
    imageAltKey: "downloads.option.browser.alt",
    href: "#downloads-install-steps",
  },
  {
    titleKey: "downloads.option.qr.title",
    bodyKey: "downloads.option.qr.body",
    statusKey: "downloads.option.ready",
    imagePath: "/assets/visual/ui/ui-downloads-mobile-qr.svg",
    imageAltKey: "downloads.option.qr.alt",
    href: "#downloads-qr",
  },
  {
    titleKey: "downloads.option.shortcut.title",
    bodyKey: "downloads.option.shortcut.body",
    statusKey: "downloads.option.ready",
    imagePath: "/assets/visual/ui/ui-downloads-home-shortcut.svg",
    imageAltKey: "downloads.option.shortcut.alt",
    href: "#downloads-install-steps",
  },
  {
    titleKey: "downloads.option.privacy.title",
    bodyKey: "downloads.option.privacy.body",
    statusKey: "downloads.option.included",
    imagePath: "/assets/visual/ui/ui-downloads-free-privacy.svg",
    imageAltKey: "downloads.option.privacy.alt",
    href: PRIVACY_ROUTE_PATH,
  },
];

const DOWNLOAD_STEPS: DownloadStep[] = [
  {
    titleKey: "downloads.steps.desktop.title",
    bodyKey: "downloads.steps.desktop.body",
  },
  {
    titleKey: "downloads.steps.android.title",
    bodyKey: "downloads.steps.android.body",
  },
  {
    titleKey: "downloads.steps.ios.title",
    bodyKey: "downloads.steps.ios.body",
  },
];

const PROMISE_ITEMS: PromiseItem[] = [
  {
    titleKey: "downloads.promise.free.title",
    bodyKey: "downloads.promise.free.body",
  },
  {
    titleKey: "downloads.promise.noAccount.title",
    bodyKey: "downloads.promise.noAccount.body",
  },
  {
    titleKey: "downloads.promise.local.title",
    bodyKey: "downloads.promise.local.body",
  },
  {
    titleKey: "downloads.promise.offline.title",
    bodyKey: "downloads.promise.offline.body",
  },
];

function localizedDownloadsPath(locale: ReturnType<typeof useI18n>["locale"]): string {
  return getLocalizedRoutePath(locale, DOWNLOADS_ROUTE_PATH as PublicRoutePath);
}

export function DownloadsPage() {
  const { locale, t } = useI18n();
  const homePath = getLocalePath(locale);
  const downloadsPath = localizedDownloadsPath(locale);
  const privacyPath = getLocalizedLegalPath(locale, PRIVACY_ROUTE_PATH);
  const termsPath = getLocalizedLegalPath(locale, TERMS_ROUTE_PATH);
  const aboutPath = getLocalizedLegalPath(locale, ABOUT_ROUTE_PATH);
  const legalPath = getLocalizedLegalPath(locale, LEGAL_ROUTE_PATH);
  const howToPlayPath = getLocalizedEditorialPath(locale, HOW_TO_PLAY_ROUTE_PATH);
  const faqPath = getLocalizedEditorialPath(locale, FAQ_ROUTE_PATH);

  return (
    <main className="downloads-page" aria-labelledby="downloads-title">
      <header className="downloads-header">
        <a className="downloads-brand" href={homePath} aria-label="Brikaya">
          <span className="downloads-brand__mark" aria-hidden="true">B</span>
          <span>Brikaya</span>
        </a>
        <nav className="downloads-nav" aria-label={t("downloads.nav.aria")}>
          <a href={homePath}>{t("downloads.nav.play")}</a>
          <a href={downloadsPath} aria-current="page">
            {t("downloads.nav.downloads")}
          </a>
          <a href={privacyPath}>{t("downloads.nav.privacy")}</a>
          <a href={termsPath}>{t("downloads.nav.terms")}</a>
          <a href={howToPlayPath}>{t("downloads.nav.howToPlay")}</a>
          <a href={faqPath}>{t("downloads.nav.faq")}</a>
          <a href={aboutPath}>{t("downloads.nav.about")}</a>
          <a href={legalPath}>{t("downloads.nav.legal")}</a>
        </nav>
      </header>

      <section className="downloads-hero">
        <div className="downloads-hero__copy">
          <h1 id="downloads-title">{t("downloads.hero.title")}</h1>
          <p>{t("downloads.hero.body")}</p>
          <div className="downloads-hero__actions" aria-label={t("downloads.hero.actionsAria")}>
            <a className="downloads-button downloads-button--primary" href={homePath}>
              {t("downloads.hero.playNow")}
            </a>
            <a className="downloads-button downloads-button--secondary" href="#downloads-install-steps">
              {t("downloads.hero.installBrowser")}
            </a>
          </div>
        </div>
        <div className="downloads-hero__media">
          <img src={DOWNLOADS_HERO_IMAGE} alt={t("downloads.hero.imageAlt")} />
        </div>
        <aside id="downloads-qr" className="downloads-qr-card" aria-label={t("downloads.qr.title")}>
          <img src={DOWNLOADS_QR_IMAGE} alt={t("downloads.qr.alt")} />
          <h2>{t("downloads.qr.title")}</h2>
          <p>{t("downloads.qr.body")}</p>
          <a href={BRIKAYA_PUBLIC_URL}>{BRIKAYA_PUBLIC_URL}</a>
        </aside>
      </section>

      <section className="downloads-section" aria-labelledby="downloads-options-title">
        <div className="downloads-section__heading">
          <h2 id="downloads-options-title">{t("downloads.options.title")}</h2>
          <p>{t("downloads.options.body")}</p>
        </div>
        <div className="downloads-option-grid">
          {DOWNLOAD_OPTIONS.map((option) => (
            <a key={option.titleKey} className="downloads-option-card" href={option.href === PRIVACY_ROUTE_PATH ? privacyPath : option.href}>
              <img src={option.imagePath} alt={t(option.imageAltKey)} />
              <span>{t(option.statusKey)}</span>
              <h3>{t(option.titleKey)}</h3>
              <p>{t(option.bodyKey)}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="downloads-install-steps" className="downloads-section downloads-steps" aria-labelledby="downloads-steps-title">
        <div className="downloads-section__heading">
          <h2 id="downloads-steps-title">{t("downloads.steps.title")}</h2>
          <p>{t("downloads.steps.body")}</p>
        </div>
        <ol className="downloads-step-list">
          {DOWNLOAD_STEPS.map((step, index) => (
            <li key={step.titleKey}>
              <span aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{t(step.titleKey)}</h3>
                <p>{t(step.bodyKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="downloads-section downloads-promise" aria-labelledby="downloads-promise-title">
        <div>
          <h2 id="downloads-promise-title">{t("downloads.promise.title")}</h2>
          <p>{t("downloads.promise.body")}</p>
        </div>
        <div className="downloads-promise__grid">
          {PROMISE_ITEMS.map((item) => (
            <article key={item.titleKey}>
              <h3>{t(item.titleKey)}</h3>
              <p>{t(item.bodyKey)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
