// tests/e2e/cloudflare-i18n-seo-qa.js
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH =
  "docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-public-validation.json";
const DEFAULT_SCREENSHOT_PATH =
  "docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-localized-menu.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const USER_DATA_DIR_PREFIX = "brikaya-i18n-seo-qa-";
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const PAGE_TIMEOUT_MS = 20000;
const OPTIONAL_CONSENT_TIMEOUT_MS = 5000;
const HTTP_OK = 200;
const ROOT_LOCALE = "pt-BR";
const TESTED_LOCALES = [
  { locale: "pt-BR", path: "/", title: "Brikaya — arcade de quebrar blocos" },
  { locale: "en", path: "/en/", title: "Brikaya — block breaker arcade" },
  { locale: "es-419", path: "/es-419/", title: "Brikaya — arcade de romper bloques" },
  { locale: "zh-CN", path: "/zh-CN/", title: "Brikaya — 打砖块街机" },
  { locale: "ar", path: "/ar/", title: "Brikaya — أركيد كسر الكتل" },
  { locale: "ru", path: "/ru/", title: "Brikaya — аркада с разбиванием блоков" },
  { locale: "nl", path: "/nl/", title: "Brikaya — blokbreker-arcade" },
  { locale: "zh-TW", path: "/zh-TW/", title: "Brikaya — 打磚塊街機" },
  { locale: "bn", path: "/bn/", title: "Brikaya — ব্লক ব্রেকার আর্কেড" },
  { locale: "ur", path: "/ur/", title: "Brikaya — بلاک بریکر آرکیڈ" },
  { locale: "fa", path: "/fa/", title: "Brikaya — آرکید شکستن بلوک" },
  { locale: "he", path: "/he/", title: "Brikaya — ארקייד שבירת בלוקים" },
  { locale: "mr", path: "/mr/", title: "Brikaya — ब्लॉक ब्रेकर आर्केड" },
  { locale: "gu", path: "/gu/", title: "Brikaya — બ્લોક બ્રેકર આર્કેડ" },
  { locale: "kn", path: "/kn/", title: "Brikaya — ಬ್ಲಾಕ್ ಬ್ರೇಕರ್ ಆರ್ಕೇಡ್" },
  { locale: "ml", path: "/ml/", title: "Brikaya — ബ്ലോക്ക് ബ്രേക്കർ ആർക്കേഡ്" },
  { locale: "pa", path: "/pa/", title: "Brikaya — ਬਲਾਕ ਬ੍ਰੇਕਰ ਆਰਕੇਡ" },
  { locale: "el", path: "/el/", title: "Brikaya — arcade σπασίματος μπλοκ" },
  { locale: "sv", path: "/sv/", title: "Brikaya — blockbrytararkad" },
  { locale: "da", path: "/da/", title: "Brikaya — blokbryder-arkade" },
  { locale: "no", path: "/no/", title: "Brikaya — blokkbrekker-arkade" },
  { locale: "fi", path: "/fi/", title: "Brikaya — palikanmurtaja-arcade" },
  { locale: "cs", path: "/cs/", title: "Brikaya — arkáda bourání bloků" },
  { locale: "bg", path: "/bg/", title: "Brikaya — аркада за разбиване на блокове" },
  { locale: "sr", path: "/sr/", title: "Brikaya — аркада разбијања блокова" },
  { locale: "af", path: "/af/", title: "Brikaya — blokbreker-arkade" },
  { locale: "uz", path: "/uz/", title: "Brikaya — blok sindirish arkadasi" },
  { locale: "my", path: "/my/", title: "Brikaya — ဘလောက်ဖျက် arcade" },
  { locale: "is", path: "/is/", title: "Brikaya — kubbabrjótsleikur" },
  { locale: "mk", path: "/mk/", title: "Brikaya — аркада за кршење блокови" },
  { locale: "ca", path: "/ca/", title: "Brikaya — arcade de trencar blocs" },
  { locale: "mi", path: "/mi/", title: "Brikaya — kēmu wāwāhi poraka" },
  { locale: "so", path: "/so/", title: "Brikaya — arcade jabinta baloogyada" },
  { locale: "yo", path: "/yo/", title: "Brikaya — ere fifọ bulọọki" },
  { locale: "ha", path: "/ha/", title: "Brikaya — wasan fasa tubali" },
  { locale: "zu", path: "/zu/", title: "Brikaya — i-arcade yokuphula amabhulokhi" },
  { locale: "rw", path: "/rw/", title: "Brikaya — umukino wo kumena ibice" },
  { locale: "ti", path: "/ti/", title: "Brikaya — ጸወታ ምስባር ብሎክ" },
  { locale: "qu", path: "/qu/", title: "Brikaya — bloquekunata pakichiy pukllay" },
  { locale: "gn", path: "/gn/", title: "Brikaya — arcade ojokóva bloque" },
  { locale: "jv", path: "/jv/", title: "Brikaya — arkade mecah blok" },
  { locale: "haw", path: "/haw/", title: "Brikaya — pāʻani wāwahi pōhaku" },
  { locale: "scn", path: "/scn/", title: "Brikaya — arcade spacca blocchi" },
  { locale: "ps", path: "/ps/", title: "Brikaya — د بلاک ماتولو ارکېډ" },
  { locale: "dv", path: "/dv/", title: "Brikaya — ބްލޮކް ފައްތާލާ އާކޭޑް" },
  { locale: "or", path: "/or/", title: "Brikaya — ବ୍ଲକ୍ ଭାଙ୍ଗିବା ଆର୍କେଡ୍" },
  { locale: "sat", path: "/sat/", title: "Brikaya — ᱵᱞᱚᱠ ᱨᱟᱯᱩᱫ ᱟᱨᱠᱮᱰ" },
  { locale: "awa", path: "/awa/", title: "Brikaya — ब्लॉक तोड़े वाला आर्केड" },
  { locale: "ace", path: "/ace/", title: "Brikaya — arked peuhancô blok" },
  { locale: "bal", path: "/bal/", title: "Brikaya — بلاک شکستن آرکید" },
  { locale: "chr", path: "/chr/", title: "Brikaya — ᎠᏍᏆᏂᎪᏗ ᏗᎪᏍᏓᏱ ᎠᏁᏍᎩ" },
  { locale: "tt", path: "/tt/", title: "Brikaya — блок вату аркадасы" },
  { locale: "ban", path: "/ban/", title: "Brikaya — arkade ngancurin blok" },
];
const ALL_HREFLANG_LOCALES = [
  "pt-BR",
  "en",
  "es-419",
  "en-IN",
  "hi-IN",
  "de",
  "fr",
  "it",
  "ja",
  "ko",
  "id",
  "vi",
  "fil",
  "th",
  "zh-CN",
  "ar",
  "ru",
  "tr",
  "nl",
  "pl",
  "uk",
  "ms",
  "zh-TW",
  "pt-PT",
  "es-ES",
  "en-GB",
  "fr-CA",
  "bn",
  "ur",
  "fa",
  "he",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "el",
  "sv",
  "da",
  "no",
  "fi",
  "cs",
  "ro",
  "hu",
  "bg",
  "sk",
  "sl",
  "hr",
  "sr",
  "lt",
  "lv",
  "et",
  "sw",
  "af",
  "am",
  "ka",
  "hy",
  "az",
  "kk",
  "uz",
  "ne",
  "si",
  "km",
  "lo",
  "my",
  "is",
  "ga",
  "cy",
  "mt",
  "sq",
  "mk",
  "bs",
  "mn",
  "tg",
  "ky",
  "tk",
  "be",
  "lb",
  "eu",
  "ca",
  "gl",
  "oc",
  "br",
  "mi",
  "sm",
  "to",
  "fj",
  "mg",
  "so",
  "yo",
  "ig",
  "ha",
  "zu",
  "xh",
  "st",
  "tn",
  "ts",
  "ss",
  "ve",
  "nso",
  "rw",
  "rn",
  "ln",
  "lg",
  "ak",
  "ee",
  "tw",
  "sn",
  "ny",
  "wo",
  "ff",
  "om",
  "ti",
  "qu",
  "ay",
  "gn",
  "nah",
  "ht",
  "pap",
  "jv",
  "su",
  "ceb",
  "ilo",
  "war",
  "haw",
  "co",
  "sc",
  "fur",
  "rm",
  "lad",
  "ast",
  "vec",
  "lmo",
  "pms",
  "nap",
  "scn",
  "sco",
  "ps",
  "sd",
  "ks",
  "dv",
  "ckb",
  "ug",
  "yi",
  "bo",
  "dz",
  "ku",
  "or",
  "as",
  "sa",
  "mai",
  "bho",
  "doi",
  "mni",
  "kok",
  "sat",
  "lus",
  "brx",
  "raj",
  "hne",
  "awa",
  "ace",
  "bal",
  "chr",
  "crh",
  "tt",
  "ba",
  "cv",
  "sah",
  "os",
  "ab",
  "ady",
  "kab",
  "tet",
  "bug",
  "min",
  "ban",
  "mad",
  "bjn",
  "hil",
  "pam",
  "bcl",
  "gor",
  "mak",
  "sas",
];
const TESTED_DOWNLOADS_LOCALES = [
  {
    locale: "pt-BR",
    path: "/downloads/",
    title: "Baixar Brikaya — jogo grátis no navegador",
  },
  {
    locale: "en",
    path: "/en/downloads/",
    title: "Download Brikaya — free browser game",
  },
  {
    locale: "es-419",
    path: "/es-419/downloads/",
    title: "Descargar Brikaya — juego gratis en el navegador",
  },
  {
    locale: "en-IN",
    path: "/en-IN/downloads/",
    title: "Download Brikaya — free browser game",
  },
  {
    locale: "hi-IN",
    path: "/hi-IN/downloads/",
    title: "Brikaya डाउनलोड करें — मुफ़्त ब्राउज़र गेम",
  },
  {
    locale: "de",
    path: "/de/downloads/",
    title: "Brikaya herunterladen — kostenloses Browser-Spiel",
  },
  {
    locale: "fr",
    path: "/fr/downloads/",
    title: "Télécharger Brikaya — jeu gratuit dans le navigateur",
  },
  {
    locale: "it",
    path: "/it/downloads/",
    title: "Scarica Brikaya — gioco gratis nel browser",
  },
  {
    locale: "ja",
    path: "/ja/downloads/",
    title: "Brikayaをダウンロード — 無料ブラウザゲーム",
  },
  {
    locale: "ko",
    path: "/ko/downloads/",
    title: "Brikaya 다운로드 — 무료 브라우저 게임",
  },
  {
    locale: "id",
    path: "/id/downloads/",
    title: "Unduh Brikaya — game browser gratis",
  },
  {
    locale: "vi",
    path: "/vi/downloads/",
    title: "Tải Brikaya — trò chơi trình duyệt miễn phí",
  },
  {
    locale: "fil",
    path: "/fil/downloads/",
    title: "I-download ang Brikaya — libreng laro sa browser",
  },
  {
    locale: "th",
    path: "/th/downloads/",
    title: "ดาวน์โหลด Brikaya — เกมเบราว์เซอร์ฟรี",
  },
  {
    locale: "zh-CN",
    path: "/zh-CN/downloads/",
    title: "下载 Brikaya — 免费浏览器游戏",
  },
  {
    locale: "ar",
    path: "/ar/downloads/",
    title: "تنزيل Brikaya — لعبة متصفح مجانية",
  },
  {
    locale: "ru",
    path: "/ru/downloads/",
    title: "Скачать Brikaya — бесплатная браузерная игра",
  },
  {
    locale: "tr",
    path: "/tr/downloads/",
    title: "Brikaya'yı indir — ücretsiz tarayıcı oyunu",
  },
  {
    locale: "nl",
    path: "/nl/downloads/",
    title: "Brikaya downloaden — gratis browserspel",
  },
  {
    locale: "pl",
    path: "/pl/downloads/",
    title: "Pobierz Brikaya — darmowa gra przeglądarkowa",
  },
  {
    locale: "uk",
    path: "/uk/downloads/",
    title: "Завантажити Brikaya — безкоштовна браузерна гра",
  },
  {
    locale: "ms",
    path: "/ms/downloads/",
    title: "Muat turun Brikaya — permainan pelayar percuma",
  },
  {
    locale: "zh-TW",
    path: "/zh-TW/downloads/",
    title: "下載 Brikaya — 免費瀏覽器遊戲",
  },
  {
    locale: "pt-PT",
    path: "/pt-PT/downloads/",
    title: "Descarregar Brikaya — jogo grátis no navegador",
  },
  {
    locale: "es-ES",
    path: "/es-ES/downloads/",
    title: "Descargar Brikaya — juego gratis en el navegador",
  },
  {
    locale: "en-GB",
    path: "/en-GB/downloads/",
    title: "Download Brikaya — free browser game",
  },
  {
    locale: "fr-CA",
    path: "/fr-CA/downloads/",
    title: "Télécharger Brikaya — jeu gratuit dans le navigateur",
  },
  {
    locale: "bn",
    path: "/bn/downloads/",
    title: "Brikaya ডাউনলোড করুন — বিনামূল্যের ব্রাউজার গেম",
  },
  {
    locale: "ur",
    path: "/ur/downloads/",
    title: "Brikaya ڈاؤن لوڈ کریں — مفت براؤزر گیم",
  },
  {
    locale: "fa",
    path: "/fa/downloads/",
    title: "دانلود Brikaya — بازی رایگان مرورگر",
  },
  {
    locale: "he",
    path: "/he/downloads/",
    title: "הורדת Brikaya — משחק דפדפן חינם",
  },
  {
    locale: "ta",
    path: "/ta/downloads/",
    title: "Brikaya பதிவிறக்கவும் — இலவச உலாவி விளையாட்டு",
  },
  {
    locale: "te",
    path: "/te/downloads/",
    title: "Brikaya డౌన్‌లోడ్ చేయండి — ఉచిత బ్రౌజర్ గేమ్",
  },
  { locale: "mr", path: "/mr/downloads/", title: "Brikaya डाउनलोड करा — मोफत ब्राउझर गेम" },
  { locale: "gu", path: "/gu/downloads/", title: "Brikaya ડાઉનલોડ કરો — મફત બ્રાઉઝર ગેમ" },
  { locale: "kn", path: "/kn/downloads/", title: "Brikaya ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ — ಉಚಿತ ಬ್ರೌಸರ್ ಆಟ" },
  { locale: "ml", path: "/ml/downloads/", title: "Brikaya ഡൗൺലോഡ് ചെയ്യുക — സൗജന്യ ബ്രൗസർ ഗെയിം" },
  { locale: "pa", path: "/pa/downloads/", title: "Brikaya ਡਾਊਨਲੋਡ ਕਰੋ — ਮੁਫ਼ਤ ਬ੍ਰਾਊਜ਼ਰ ਗੇਮ" },
  { locale: "el", path: "/el/downloads/", title: "Λήψη Brikaya — δωρεάν παιχνίδι browser" },
  { locale: "sv", path: "/sv/downloads/", title: "Ladda ner Brikaya — gratis webbläsarspel" },
  { locale: "da", path: "/da/downloads/", title: "Download Brikaya — gratis browserspil" },
  { locale: "no", path: "/no/downloads/", title: "Last ned Brikaya — gratis nettleserspill" },
  { locale: "fi", path: "/fi/downloads/", title: "Lataa Brikaya — ilmainen selainpeli" },
  { locale: "cs", path: "/cs/downloads/", title: "Stáhnout Brikaya — bezplatná hra v prohlížeči" },
  { locale: "bg", path: "/bg/downloads/", title: "Изтеглете Brikaya — безплатна игра в браузъра" },
  { locale: "sr", path: "/sr/downloads/", title: "Преузми Brikaya — бесплатна игра у прегледачу" },
  { locale: "af", path: "/af/downloads/", title: "Laai Brikaya af — gratis blaaier-speletjie" },
  { locale: "uz", path: "/uz/downloads/", title: "Brikaya yuklab olish — bepul brauzer o‘yini" },
  { locale: "my", path: "/my/downloads/", title: "Brikaya ဒေါင်းလုဒ်လုပ်ရန် — အခမဲ့ ဘရောက်ဇာဂိမ်း" },
  { locale: "is", path: "/is/downloads/", title: "Sækja Brikaya — ókeypis vafraleikur" },
  { locale: "mk", path: "/mk/downloads/", title: "Преземи Brikaya — бесплатна игра во прелистувач" },
  { locale: "ca", path: "/ca/downloads/", title: "Baixa Brikaya — joc gratuït de navegador" },
  { locale: "mi", path: "/mi/downloads/", title: "Tikiake Brikaya — kēmu pūtirotiro kore utu" },
  { locale: "so", path: "/so/downloads/", title: "Soo dejiso Brikaya — ciyaar biraawsar bilaash ah" },
  {
    locale: "yo",
    path: "/yo/downloads/",
    title: "Gba Brikaya silẹ — ere aṣàwákiri ọfẹ",
  },
  {
    locale: "ha",
    path: "/ha/downloads/",
    title: "Zazzage Brikaya — wasan burauza kyauta",
  },
  {
    locale: "zu",
    path: "/zu/downloads/",
    title: "Landa i-Brikaya — umdlalo wesiphequluli wamahhala",
  },
  {
    locale: "rw",
    path: "/rw/downloads/",
    title: "Kuramo Brikaya — umukino wa mushakisha w'ubuntu",
  },
  {
    locale: "ti",
    path: "/ti/downloads/",
    title: "Brikaya ኣውርድ — ናጻ ናይ browser ጸወታ",
  },
  {
    locale: "qu",
    path: "/qu/downloads/",
    title: "Brikaya uraykachiy — mana qullqiyuq maskana pukllay",
  },
  {
    locale: "gn",
    path: "/gn/downloads/",
    title: "Emboguejy Brikaya — ñanduti kundahára ñembosarái reigua",
  },
  {
    locale: "jv",
    path: "/jv/downloads/",
    title: "Undhuh Brikaya — game browser gratis",
  },
  {
    locale: "haw",
    path: "/haw/downloads/",
    title: "Hoʻoiho iā Brikaya — pāʻani polokalamu kele pūnaewele manuahi",
  },
  {
    locale: "scn",
    path: "/scn/downloads/",
    title: "Scàrrica Brikaya — jocu di browser gratis",
  },
  {
    locale: "ps",
    path: "/ps/downloads/",
    title: "Brikaya ډاونلوډ کړئ — وړیا براوزر لوبه",
  },
  {
    locale: "dv",
    path: "/dv/downloads/",
    title: "Brikaya ޑައުންލޯޑް ކުރޭ — ހިލޭ ބްރައުޒަރ ގޭމް",
  },
  {
    locale: "or",
    path: "/or/downloads/",
    title: "Brikaya ଡାଉନଲୋଡ୍ କରନ୍ତୁ — ମାଗଣା ବ୍ରାଉଜର ଖେଳ",
  },
  {
    locale: "sat",
    path: "/sat/downloads/",
    title: "Brikaya ᱰᱟᱣᱱᱞᱳᱰ ᱢᱮ — ᱯᱷᱨᱤ ᱵᱽᱨᱟᱣᱡᱟᱨ ᱠᱷᱮᱞ",
  },
  {
    locale: "awa",
    path: "/awa/downloads/",
    title: "Brikaya डाउनलोड करा — मुफ्त ब्राउजर खेल",
  },
  {
    locale: "ace",
    path: "/ace/downloads/",
    title: "Unduh Brikaya — game browser gratis",
  },
  {
    locale: "bal",
    path: "/bal/downloads/",
    title: "Brikaya ڈاؤن لوڈ کن — مفت براوزر گیم",
  },
  {
    locale: "chr",
    path: "/chr/downloads/",
    title: "Brikaya ᏫᎩᎶᏒᎢ — ᎾᎿᎢ ᎠᎾᏗᏍᎩ ᎠᏁᏍᎩ",
  },
  {
    locale: "tt",
    path: "/tt/downloads/",
    title: "Brikaya йөкләү — бушлай браузер уены",
  },
  {
    locale: "ban",
    path: "/ban/downloads/",
    title: "Unduh Brikaya — game browser gratis",
  },
];
const LANGUAGE_SELECT_SELECTOR = "#game-language-select";
const MENU_BUTTON_SELECTOR = ".dashboard-menu-button";
const CONSENT_BUTTON_SELECTOR = ".consent-screen__button";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const LANGUAGE_DETECTION_OVERLAY_SELECTOR =
  '[data-testid="language-detection-overlay"]';
const PRE_GAME_ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const MENU_OPEN_ATTEMPTS = 3;
const MENU_OPEN_RETRY_TIMEOUT_MS = 5000;
const CHINESE_MENU_TEXT = "隐私";
const ROOT_CANONICAL = "https://brikaya.com/";
const RTL_LOCALES = new Set(["ar", "ur", "fa", "he", "ps", "sd", "ks", "dv", "ckb", "ug", "yi", "bal"]);
const BROWSER_AUTO_LANGUAGE = "es-MX";
const BROWSER_AUTO_LANGUAGES = ["es-MX", "en-US"];
const BROWSER_AUTO_EXPECTED_LOCALE = "es-419";
const BROWSER_AUTO_EXPECTED_PATH = "/es-419/";
const TIME_ZONE_AUTO_LANGUAGE = "eo-EO";
const TIME_ZONE_AUTO_LANGUAGES = ["eo-EO"];
const TIME_ZONE_AUTO_VALUE = "Europe/Berlin";
const TIME_ZONE_AUTO_EXPECTED_LOCALE = "de";
const TIME_ZONE_AUTO_EXPECTED_PATH = "/de/";
const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const MANUAL_LOCALE_SOURCE = "manual";
const SITEMAP_PATH = "/sitemap.xml";
const ROBOTS_PATH = "/robots.txt";
const STATIC_PUBLIC_PATHS = ["/privacy/", "/terms/"];
const REPORT_JSON_SPACES = 2;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRIKAYA_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env("BRIKAYA_I18N_SEO_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRIKAYA_I18N_SEO_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalFor(baseUrl, locale, path) {
  return locale === ROOT_LOCALE && path === "/" ? ROOT_CANONICAL : new URL(path, baseUrl).href;
}

function htmlLangPattern(locale) {
  const direction = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  return new RegExp(`<html lang="${locale}"(?: dir="${direction}")?>`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchText(url) {
  const response = await fetch(url);
  const body = await response.text();
  return { status: response.status, body };
}

async function validateHtml(baseUrl, item) {
  const url = new URL(item.path, baseUrl).href;
  const { status, body } = await fetchText(url);
  const canonical = canonicalFor(baseUrl, item.locale, item.path);

  assert(status === HTTP_OK, `${url} status=${status}`);
  assert(
    htmlLangPattern(item.locale).test(body),
    `${url} sem lang ${item.locale}`,
  );
  assert(
    body.includes(`<link rel="canonical" href="${canonical}" />`),
    `${url} canonical incorreto`,
  );
  assert(
    body.includes(`<title>${escapeHtml(item.title)}</title>`),
    `${url} title incorreto`,
  );
  assert(!body.includes(".pages.dev"), `${url} contém pages.dev`);
  assert(!body.includes('href="./assets/'), `${url} tem href asset relativo`);
  assert(!body.includes('src="./assets/'), `${url} tem src asset relativo`);
  for (const locale of ALL_HREFLANG_LOCALES) {
    assert(
      body.includes(`hreflang="${locale}"`),
      `${url} sem hreflang ${locale}`,
    );
  }
  assert(body.includes('hreflang="x-default"'), `${url} sem x-default`);

  return { url, status, canonical, locale: item.locale };
}

async function validateSitemapAndRobots(baseUrl) {
  const sitemapUrl = new URL(SITEMAP_PATH, baseUrl).href;
  const robotsUrl = new URL(ROBOTS_PATH, baseUrl).href;
  const sitemap = await fetchText(sitemapUrl);
  const robots = await fetchText(robotsUrl);

  assert(sitemap.status === HTTP_OK, `sitemap status=${sitemap.status}`);
  assert(robots.status === HTTP_OK, `robots status=${robots.status}`);
  for (const locale of ALL_HREFLANG_LOCALES) {
    const path = locale === ROOT_LOCALE ? "/" : `/${locale}/`;
    assert(
      sitemap.body.includes(`<loc>${new URL(path, baseUrl).href}</loc>`),
      `sitemap sem ${locale}`,
    );
    const downloadsPath =
      locale === ROOT_LOCALE ? "/downloads/" : `/${locale}/downloads/`;
    assert(
      sitemap.body.includes(
        `<loc>${new URL(downloadsPath, baseUrl).href}</loc>`,
      ),
      `sitemap sem downloads ${locale}`,
    );
  }
  for (const path of STATIC_PUBLIC_PATHS) {
    assert(
      sitemap.body.includes(`<loc>${new URL(path, baseUrl).href}</loc>`),
      `sitemap sem ${path}`,
    );
  }
  assert(robots.body.includes(`Sitemap: ${sitemapUrl}`), "robots sem sitemap");

  return {
    sitemapUrl,
    robotsUrl,
    sitemapStatus: sitemap.status,
    robotsStatus: robots.status,
  };
}

async function closeBrowser(browser) {
  let timedOut = false;
  await Promise.race([
    browser.close(),
    new Promise((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve();
      }, BROWSER_CLOSE_TIMEOUT_MS),
    ),
  ]);
  if (timedOut) {
    const browserProcess = browser.process();
    browser.disconnect();
    browserProcess?.kill("SIGTERM");
  }
}

async function acceptPreGamePromptIfVisible(page) {
  const accepted = await page.evaluate((acceptLabel) => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.trim() === acceptLabel,
    );
    if (!button) return false;
    button.click();
    return true;
  }, PRE_GAME_ACCEPT_BUTTON_LABEL);

  if (accepted) {
    await page.waitForFunction(
      (acceptLabel) => !(document.body.textContent || "").includes(acceptLabel),
      { timeout: PAGE_TIMEOUT_MS },
      PRE_GAME_ACCEPT_BUTTON_LABEL,
    );
  }
}

async function waitForCinematicOverlayToClear(page) {
  await page
    .waitForSelector(LANGUAGE_DETECTION_OVERLAY_SELECTOR, {
      hidden: true,
      timeout: PAGE_TIMEOUT_MS,
    })
    .catch(() => null);
  await page
    .waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
      hidden: true,
      timeout: PAGE_TIMEOUT_MS,
    })
    .catch(() => null);
}

async function openMenuAndWaitForLanguageSelector(page) {
  for (let attempt = 0; attempt < MENU_OPEN_ATTEMPTS; attempt += 1) {
    await waitForCinematicOverlayToClear(page);
    await page.waitForSelector(MENU_BUTTON_SELECTOR, {
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.click(MENU_BUTTON_SELECTOR);
    const selector = await page
      .waitForSelector(LANGUAGE_SELECT_SELECTOR, {
        timeout: MENU_OPEN_RETRY_TIMEOUT_MS,
      })
      .catch(() => null);
    if (selector) return;
  }

  throw new Error("Menu de idioma não abriu no app publicado.");
}

async function validateRuntimeLanguageSwitch(baseUrl, outputScreenshotPath) {
  const userDataDir = mkdtempSync(`${tmpdir()}/${USER_DATA_DIR_PREFIX}`);
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 852,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    const consentButton = await page
      .waitForSelector(CONSENT_BUTTON_SELECTOR, {
        timeout: OPTIONAL_CONSENT_TIMEOUT_MS,
      })
      .catch(() => null);
    if (consentButton) {
      await consentButton.click();
      await waitForCinematicOverlayToClear(page);
    }
    await acceptPreGamePromptIfVisible(page);
    await openMenuAndWaitForLanguageSelector(page);
    await page.select(LANGUAGE_SELECT_SELECTOR, "zh-CN");
    await page.waitForFunction(
      () => document.documentElement.lang === "zh-CN",
      { timeout: PAGE_TIMEOUT_MS },
    );
    await page.waitForFunction(
      (text) => document.body.textContent?.includes(text),
      { timeout: PAGE_TIMEOUT_MS },
      CHINESE_MENU_TEXT,
    );
    ensureParentDirectory(outputScreenshotPath);
    await page.screenshot({ path: outputScreenshotPath, fullPage: true });
    const runtimeState = await page.evaluate(
      (localeKey, sourceKey) => ({
        lang: document.documentElement.lang,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        path: window.location.pathname,
        visibleChinese: document.body.textContent?.includes("隐私") || false,
        storedLocale: window.localStorage.getItem(localeKey),
        storedSource: window.localStorage.getItem(sourceKey),
      }),
      LOCALE_STORAGE_KEY,
      LOCALE_SOURCE_STORAGE_KEY,
    );
    assert(
      runtimeState.storedLocale === "zh-CN",
      "preferência manual não persistiu locale",
    );
    assert(
      runtimeState.storedSource === MANUAL_LOCALE_SOURCE,
      "preferência manual não persistiu origem",
    );
    await page.reload({ waitUntil: "networkidle2", timeout: PAGE_TIMEOUT_MS });
    await page.waitForFunction(
      () => document.documentElement.lang === "zh-CN",
      { timeout: PAGE_TIMEOUT_MS },
    );
    const reloadedState = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      path: window.location.pathname,
    }));

    return { ...runtimeState, reloadedState };
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function validateRuntimeBrowserLocale(baseUrl) {
  const userDataDir = mkdtempSync(`${tmpdir()}/${USER_DATA_DIR_PREFIX}`);
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(
      (languages, language) => {
        Object.defineProperty(window.navigator, "languages", {
          configurable: true,
          get: () => languages,
        });
        Object.defineProperty(window.navigator, "language", {
          configurable: true,
          get: () => language,
        });
        localStorage.clear();
        sessionStorage.clear();
      },
      BROWSER_AUTO_LANGUAGES,
      BROWSER_AUTO_LANGUAGE,
    );
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.waitForFunction(
      (locale) => document.documentElement.lang === locale,
      { timeout: PAGE_TIMEOUT_MS },
      BROWSER_AUTO_EXPECTED_LOCALE,
    );
    await page.waitForFunction(
      (path) => window.location.pathname === path,
      { timeout: PAGE_TIMEOUT_MS },
      BROWSER_AUTO_EXPECTED_PATH,
    );

    const runtimeState = await page.evaluate(
      (localeKey, sourceKey) => ({
        lang: document.documentElement.lang,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        path: window.location.pathname,
        storedLocale: window.localStorage.getItem(localeKey),
        storedSource: window.localStorage.getItem(sourceKey),
      }),
      LOCALE_STORAGE_KEY,
      LOCALE_SOURCE_STORAGE_KEY,
    );
    assert(
      runtimeState.canonical ===
        new URL(BROWSER_AUTO_EXPECTED_PATH, baseUrl).href,
      "canonical não acompanhou idioma automático do navegador",
    );
    assert(
      runtimeState.storedLocale === null,
      "detecção automática por idioma não deve salvar locale manual",
    );
    assert(
      runtimeState.storedSource === null,
      "detecção automática por idioma não deve salvar origem manual",
    );

    return runtimeState;
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function validateRuntimeTimeZoneLocale(baseUrl) {
  const userDataDir = mkdtempSync(`${tmpdir()}/${USER_DATA_DIR_PREFIX}`);
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });

  try {
    const page = await browser.newPage();
    await page.emulateTimezone(TIME_ZONE_AUTO_VALUE);
    await page.evaluateOnNewDocument(
      (languages, language) => {
        Object.defineProperty(window.navigator, "languages", {
          configurable: true,
          get: () => languages,
        });
        Object.defineProperty(window.navigator, "language", {
          configurable: true,
          get: () => language,
        });
        localStorage.clear();
        sessionStorage.clear();
      },
      TIME_ZONE_AUTO_LANGUAGES,
      TIME_ZONE_AUTO_LANGUAGE,
    );
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.waitForFunction(
      (locale) => document.documentElement.lang === locale,
      { timeout: PAGE_TIMEOUT_MS },
      TIME_ZONE_AUTO_EXPECTED_LOCALE,
    );
    await page.waitForFunction(
      (path) => window.location.pathname === path,
      { timeout: PAGE_TIMEOUT_MS },
      TIME_ZONE_AUTO_EXPECTED_PATH,
    );

    const runtimeState = await page.evaluate(
      (storageKey) => ({
        lang: document.documentElement.lang,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        path: window.location.pathname,
        storedLocale: window.localStorage.getItem(storageKey),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      LOCALE_STORAGE_KEY,
    );
    assert(
      runtimeState.canonical ===
        new URL(TIME_ZONE_AUTO_EXPECTED_PATH, baseUrl).href,
      "canonical não acompanhou fuso horário automático do navegador",
    );
    assert(
      runtimeState.storedLocale === null,
      "detecção automática por fuso não deve salvar preferência manual",
    );

    return runtimeState;
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function run() {
  const baseUrl = publicUrl();
  const htmlResults = [];
  for (const item of [...TESTED_LOCALES, ...TESTED_DOWNLOADS_LOCALES]) {
    htmlResults.push(await validateHtml(baseUrl, item));
  }
  const sitemapRobots = await validateSitemapAndRobots(baseUrl);
  const runtime = await validateRuntimeLanguageSwitch(
    baseUrl,
    screenshotPath(),
  );
  const browserLocaleRuntime = await validateRuntimeBrowserLocale(baseUrl);
  const timeZoneLocaleRuntime = await validateRuntimeTimeZoneLocale(baseUrl);
  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    localesChecked: TESTED_LOCALES.map((item) => item.locale),
    downloadsLocalesChecked: TESTED_DOWNLOADS_LOCALES.map((item) => item.locale),
    hreflangLocales: ALL_HREFLANG_LOCALES,
    htmlResults,
    sitemapRobots,
    runtime,
    browserLocaleRuntime,
    timeZoneLocaleRuntime,
    screenshot: screenshotPath(),
  };

  ensureParentDirectory(reportPath());
  writeFileSync(
    reportPath(),
    `${JSON.stringify(report, null, REPORT_JSON_SPACES)}\n`,
  );
  console.log(`cloudflare-i18n-seo-qa ok: report=${reportPath()}`);
}

run().catch((error) => {
  console.error("cloudflare-i18n-seo-qa failed", error);
  process.exitCode = 1;
});
