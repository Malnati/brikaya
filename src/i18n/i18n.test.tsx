// src/i18n/i18n.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  I18nProvider,
  SUPPORTED_LOCALES,
  getCanonicalUrl,
  getLocalePath,
  getSeoMetadata,
  useI18n,
  type AppLocale,
} from ".";
import { EN_MESSAGES, I18N_MESSAGES, type TranslationKey } from "./messages";
import { DOWNLOADS_ROUTE_PATH } from "../routes";

const TEST_ROUTE = "/";
const TEST_CAMPAIGN_SEARCH =
  "?utm_source=google&utm_medium=paid-search&utm_campaign=brikaya-p0-latam-test";
const TEST_TITLE_KEY = "seo.title";
const PORTUGUESE_LOCALE: AppLocale = "pt-BR";
const SPANISH_LOCALE: AppLocale = "es-419";
const CHINESE_LOCALE: AppLocale = "zh-CN";
const HINDI_LOCALE: AppLocale = "hi-IN";
const ENGLISH_LOCALE: AppLocale = "en";
const GERMAN_LOCALE: AppLocale = "de";
const DUTCH_BROWSER_LANGUAGE = "nl-NL";
const UNSUPPORTED_BROWSER_LANGUAGE = "eo-EO";
const GERMAN_BROWSER_LANGUAGE = "de-DE";
const FRENCH_BROWSER_LANGUAGE = "fr-FR";
const FRENCH_LOCALE: AppLocale = "fr";
const CANONICAL_ROOT = "https://brikaya.com/";
const SPANISH_CANONICAL = "https://brikaya.com/es-419/";
const CHINESE_TITLE = "Brikaya — 打砖块街机";
const MENU_LABEL = "Menú";
const LIME_GRAPHITE_LABEL = "Lima grafite";
const LOG_SPEED_LABEL = "Velocidade atual";
const BUTTON_LABEL = "switch";
const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const LOCALE_DETECTION_STORAGE_KEY = "brikaya-locale-detection";
const MANUAL_LOCALE_SOURCE = "manual";
const NAVIGATOR_LANGUAGES_PROPERTY = "languages";
const NAVIGATOR_LANGUAGE_PROPERTY = "language";
const GERMANY_TIME_ZONE = "Europe/Berlin";
const MEXICO_TIME_ZONE = "America/Mexico_City";
const INDIA_TIME_ZONE = "Asia/Kolkata";
const UNSUPPORTED_TIME_ZONE = "Pacific/Kanton";
const ENGLISH_LOCALES = new Set<AppLocale>(["en", "en-IN", "en-GB"]);
const EXPECTED_GLOBAL_LOCALES = [
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
  "fy",
  "fo",
  "gd",
  "gv",
  "kw",
  "se",
  "kl",
  "iu",
  "cr",
  "oj",
  "lkt",
  "nv",
  "ik",
  "ch",
  "mh",
  "ty",
  "bi",
  "na",
  "gil",
  "niu",
  "rar",
  "pau",
  "tpi",
  "ho",
] as const;
const NEW_DOWNLOADS_SEO_EXPECTATIONS = [
  { locale: "ar", title: "تنزيل Brikaya", description: "بدون حساب" },
  { locale: "ru", title: "Скачать Brikaya", description: "без аккаунта" },
  { locale: "tr", title: "Brikaya'yı indir", description: "hesap yok" },
  { locale: "nl", title: "Brikaya downloaden", description: "geen account" },
  { locale: "pl", title: "Pobierz Brikaya", description: "bez konta" },
  { locale: "uk", title: "Завантажити Brikaya", description: "без облікового запису" },
  { locale: "ms", title: "Muat turun Brikaya", description: "tanpa akaun" },
  { locale: "zh-TW", title: "下載 Brikaya", description: "無需帳號" },
  { locale: "pt-PT", title: "Descarregar Brikaya", description: "sem conta" },
  { locale: "es-ES", title: "Descargar Brikaya", description: "sin cuenta" },
  { locale: "en-GB", title: "Download Brikaya", description: "no account" },
  { locale: "fr-CA", title: "Télécharger Brikaya", description: "sans compte" },
  { locale: "bn", title: "Brikaya ডাউনলোড করুন", description: "অ্যাকাউন্ট ছাড়া" },
  { locale: "ur", title: "Brikaya ڈاؤن لوڈ کریں", description: "اکاؤنٹ کے بغیر" },
  { locale: "fa", title: "دانلود Brikaya", description: "بدون حساب" },
  { locale: "he", title: "הורדת Brikaya", description: "בלי חשבון" },
  { locale: "ta", title: "Brikaya பதிவிறக்கவும்", description: "கணக்கு இல்லாமல்" },
  { locale: "te", title: "Brikaya డౌన్‌లోడ్ చేయండి", description: "ఖాతా లేకుండా" },
  { locale: "mr", title: "Brikaya डाउनलोड करा", description: "खाते नसताना" },
  { locale: "gu", title: "Brikaya ડાઉનલોડ કરો", description: "ખાતા વગર" },
  { locale: "kn", title: "Brikaya ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", description: "ಖಾತೆ ಇಲ್ಲದೆ" },
  { locale: "ml", title: "Brikaya ഡൗൺലോഡ് ചെയ്യുക", description: "അക്കൗണ്ട് ഇല്ലാതെ" },
  { locale: "pa", title: "Brikaya ਡਾਊਨਲੋਡ ਕਰੋ", description: "ਖਾਤੇ ਤੋਂ ਬਿਨਾਂ" },
  { locale: "el", title: "Λήψη Brikaya", description: "χωρίς λογαριασμό" },
  { locale: "sv", title: "Ladda ner Brikaya", description: "utan konto" },
  { locale: "da", title: "Download Brikaya", description: "uden konto" },
  { locale: "no", title: "Last ned Brikaya", description: "uten konto" },
  { locale: "fi", title: "Lataa Brikaya", description: "ilman tiliä" },
  { locale: "cs", title: "Stáhnout Brikaya", description: "bez účtu" },
  { locale: "ro", title: "Descarcă Brikaya", description: "fără cont" },
  { locale: "hu", title: "Brikaya letöltése", description: "fiók nélkül" },
  { locale: "bg", title: "Изтеглете Brikaya", description: "без акаунт" },
  { locale: "sk", title: "Stiahnuť Brikaya", description: "bez účtu" },
  { locale: "sl", title: "Prenesi Brikaya", description: "brez računa" },
  { locale: "hr", title: "Preuzmi Brikaya", description: "bez računa" },
  { locale: "sr", title: "Преузми Brikaya", description: "без налога" },
  { locale: "lt", title: "Atsisiųsti Brikaya", description: "be paskyros" },
  { locale: "lv", title: "Lejupielādēt Brikaya", description: "bez konta" },
  { locale: "et", title: "Laadi alla Brikaya", description: "ilma kontota" },
  { locale: "sw", title: "Pakua Brikaya", description: "bila akaunti" },
  { locale: "af", title: "Laai Brikaya af", description: "sonder rekening" },
  { locale: "am", title: "Brikaya አውርድ", description: "ያለ መለያ" },
  { locale: "ka", title: "ჩამოტვირთეთ Brikaya", description: "ანგარიშის გარეშე" },
  { locale: "hy", title: "Ներբեռնել Brikaya", description: "առանց հաշվի" },
  { locale: "az", title: "Brikaya endirin", description: "hesabsız" },
  { locale: "kk", title: "Brikaya жүктеп алу", description: "есептік жазбасыз" },
  { locale: "uz", title: "Brikaya yuklab olish", description: "hisobsiz" },
  { locale: "ne", title: "Brikaya डाउनलोड गर्नुहोस्", description: "खाता बिना" },
  { locale: "si", title: "Brikaya බාගන්න", description: "ගිණුමක් නැතිව" },
  { locale: "km", title: "ទាញយក Brikaya", description: "គ្មានគណនី" },
  { locale: "lo", title: "ດາວໂຫຼດ Brikaya", description: "ບໍ່ຕ້ອງມີບັນຊີ" },
  { locale: "my", title: "Brikaya ဒေါင်းလုဒ်လုပ်ရန်", description: "အကောင့်မလို" },
  { locale: "is", title: "Sækja Brikaya", description: "án reiknings" },
  { locale: "ga", title: "Íoslódáil Brikaya", description: "gan chuntas" },
  { locale: "cy", title: "Lawrlwytho Brikaya", description: "heb gyfrif" },
  { locale: "mt", title: "Niżżel Brikaya", description: "mingħajr kont" },
  { locale: "sq", title: "Shkarko Brikaya", description: "pa llogari" },
  { locale: "mk", title: "Преземи Brikaya", description: "без сметка" },
  { locale: "bs", title: "Preuzmi Brikaya", description: "bez računa" },
  { locale: "mn", title: "Brikaya татаж авах", description: "бүртгэлгүй" },
  { locale: "tg", title: "Боргирии Brikaya", description: "бе ҳисоб" },
  { locale: "ky", title: "Brikaya жүктөп алуу", description: "эсепсиз" },
  { locale: "tk", title: "Brikaya ýükläp al", description: "hasapsyz" },
  { locale: "be", title: "Спампаваць Brikaya", description: "без уліковага запісу" },
  { locale: "lb", title: "Brikaya eroflueden", description: "ouni Kont" },
  { locale: "eu", title: "Deskargatu Brikaya", description: "konturik gabe" },
  { locale: "ca", title: "Baixa Brikaya", description: "sense compte" },
  { locale: "gl", title: "Descargar Brikaya", description: "sen conta" },
  { locale: "oc", title: "Telecargar Brikaya", description: "sens compte" },
  { locale: "br", title: "Pellgargañ Brikaya", description: "hep kont" },
  { locale: "mi", title: "Tikiake Brikaya", description: "kāore he pūkete" },
  { locale: "sm", title: "La'u mai Brikaya", description: "leai se teugatupe" },
  { locale: "to", title: "Hiki mai Brikaya", description: "ʻikai ha ʻakauni" },
  { locale: "fj", title: "Lavetaka Brikaya", description: "sega ni akaude" },
  { locale: "mg", title: "Ampidino Brikaya", description: "tsy mila kaonty" },
  { locale: "so", title: "Soo dejiso Brikaya", description: "xisaab la'aan" },
  { locale: "yo", title: "Gba Brikaya silẹ", description: "laisi akọọlẹ" },
  { locale: "ig", title: "Budata Brikaya", description: "enweghị akaụntụ" },
  { locale: "ha", title: "Zazzage Brikaya", description: "ba tare da asusu ba" },
  { locale: "zu", title: "Landa i-Brikaya", description: "ngaphandle kwe-akhawunti" },
  { locale: "xh", title: "Khuphela i-Brikaya", description: "ngaphandle kweakhawunti" },
  { locale: "st", title: "Khoasolla Brikaya", description: "ntle le akhaonto" },
  { locale: "tn", title: "Folosa Brikaya", description: "ntle le akhaonto" },
  { locale: "ts", title: "Dawuniloda Brikaya", description: "handle ka akhawunti" },
  { locale: "ss", title: "Landa Brikaya", description: "ngaphandle kwe-akhawunti" },
  { locale: "ve", title: "Dzhia Brikaya", description: "hu si na akhaunthu" },
  { locale: "nso", title: "Laolla Brikaya", description: "ntle le akhaonto" },
  { locale: "rw", title: "Kuramo Brikaya", description: "nta konti" },
  { locale: "rn", title: "Manura Brikaya", description: "ata konti" },
  { locale: "ln", title: "Zwa Brikaya", description: "konto te" },
  { locale: "lg", title: "Wanula Brikaya", description: "awatali akawunti" },
  { locale: "ak", title: "Twe Brikaya", description: "konto biara nni ho" },
  { locale: "ee", title: "Ðe Brikaya", description: "akɔntabubu manɔmee" },
  { locale: "tw", title: "Twe Brikaya", description: "konto biara nni ho" },
  { locale: "sn", title: "Dhawunirodha Brikaya", description: "pasina account" },
  { locale: "ny", title: "Tsitsani Brikaya", description: "popanda akaunti" },
  { locale: "wo", title: "Yebbi Brikaya", description: "amul kont" },
  { locale: "ff", title: "Aawto Brikaya", description: "alaa konte" },
  { locale: "om", title: "Brikaya buusi", description: "herrega malee" },
  { locale: "ti", title: "Brikaya ኣውርድ", description: "ብዘይ ሒሳብ" },
  { locale: "qu", title: "Brikaya uraykachiy", description: "mana yupayniyuq" },
  { locale: "ay", title: "Brikaya apaqaña", description: "jan cuenta" },
  { locale: "gn", title: "Emboguejy Brikaya", description: "cuenta'ỹre" },
  { locale: "nah", title: "Temo Brikaya", description: "amo cuenta" },
  { locale: "ht", title: "Telechaje Brikaya", description: "san kont" },
  { locale: "pap", title: "Deskargá Brikaya", description: "sin cuenta" },
  { locale: "jv", title: "Undhuh Brikaya", description: "tanpa akun" },
  { locale: "su", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "ceb", title: "I-download ang Brikaya", description: "walay account" },
  { locale: "ilo", title: "I-download ti Brikaya", description: "awan account" },
  { locale: "war", title: "I-download an Brikaya", description: "waray account" },
  { locale: "haw", title: "Hoʻoiho iā Brikaya", description: "ʻaʻohe moʻokāki" },
  { locale: "co", title: "Scaricà Brikaya", description: "senza contu" },
  { locale: "sc", title: "Iscàrriga Brikaya", description: "chentza contu" },
  { locale: "fur", title: "Discjame Brikaya", description: "cence account" },
  { locale: "rm", title: "Telechargiar Brikaya", description: "senza conto" },
  { locale: "lad", title: "Deskargar Brikaya", description: "sin kuenta" },
  { locale: "ast", title: "Baxar Brikaya", description: "ensin cuenta" },
  { locale: "vec", title: "Descarga Brikaya", description: "senza account" },
  { locale: "lmo", title: "Scarica Brikaya", description: "senza account" },
  { locale: "pms", title: "Scaria Brikaya", description: "sensa account" },
  { locale: "nap", title: "Scarica Brikaya", description: "senza cunto" },
  { locale: "scn", title: "Scàrrica Brikaya", description: "senza cuntu" },
  { locale: "sco", title: "Dounload Brikaya", description: "nae accoont" },
  { locale: "ps", title: "Brikaya ډاونلوډ کړئ", description: "بې حسابه" },
  { locale: "sd", title: "Brikaya ڊائونلوڊ ڪريو", description: "اڪائونٽ کانسواءِ" },
  { locale: "ks", title: "Brikaya ڈاؤنلوڈ کٔرِو", description: "اکاؤنٹ بغیر" },
  { locale: "dv", title: "Brikaya ޑައުންލޯޑް ކުރޭ", description: "އެކައުންޓް ނެތި" },
  { locale: "ckb", title: "Brikaya دابەزێنە", description: "بێ هەژمار" },
  { locale: "ug", title: "Brikaya نى چۈشۈرۈڭ", description: "ھېساباتسىز" },
  { locale: "yi", title: "אַראָפּלאָדן Brikaya", description: "אָן חשבון" },
  { locale: "bo", title: "Brikaya ཕབ་ལེན", description: "ཐོ་ཁོངས་མེད" },
  { locale: "dz", title: "Brikaya ཕབ་ལེན", description: "རྩིས་ཁྲ་མེད" },
  { locale: "ku", title: "Brikaya daxîne", description: "bê hesab" },
  { locale: "or", title: "Brikaya ଡାଉନଲୋଡ୍ କରନ୍ତୁ", description: "ଖାତା ବିନା" },
  { locale: "as", title: "Brikaya ডাউনল’ড কৰক", description: "একাউন্ট নোহোৱাকৈ" },
  { locale: "sa", title: "Brikaya अवतारयतु", description: "लेखां विना" },
  { locale: "mai", title: "Brikaya डाउनलोड करू", description: "खाता बिना" },
  { locale: "bho", title: "Brikaya डाउनलोड करीं", description: "खाता बिना" },
  { locale: "doi", title: "Brikaya डाउनलोड करो", description: "खाते बिना" },
  { locale: "mni", title: "Brikaya ডাউনলোড তৌ", description: "একাউন্ট নত্তনা" },
  { locale: "kok", title: "Brikaya डाउनलोड करात", description: "खाते शिवाय" },
  { locale: "sat", title: "Brikaya ᱰᱟᱣᱱᱞᱳᱰ ᱢᱮ", description: "ᱟᱠᱟᱣᱱᱴ ᱵᱟᱝ" },
  { locale: "lus", title: "Brikaya download rawh", description: "account tel lovin" },
  { locale: "brx", title: "Brikaya डाउनलोड खालाम", description: "एकाउन्ट गैयाबालानो" },
  { locale: "raj", title: "Brikaya डाउनलोड करो", description: "खातो बिना" },
  { locale: "hne", title: "Brikaya डाउनलोड करव", description: "खाता बिना" },
  { locale: "awa", title: "Brikaya डाउनलोड करा", description: "खाता बिना" },
  { locale: "ace", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "bal", title: "Brikaya ڈاؤن لوڈ کن", description: "بے حساب" },
  { locale: "chr", title: "Brikaya ᏫᎩᎶᏒᎢ", description: "ᎠᎪᏩᏛᏗ ᎾᏍᎩ Ꮭ" },
  { locale: "crh", title: "Brikaya indir", description: "hesapsız" },
  { locale: "tt", title: "Brikaya йөкләү", description: "аккаунтсыз" },
  { locale: "ba", title: "Brikaya йөкләп алыу", description: "иҫәпһеҙ" },
  { locale: "cv", title: "Brikaya илсе", description: "аккаунтсӑр" },
  { locale: "sah", title: "Brikaya хачайдаа", description: "аккаунт суох" },
  { locale: "os", title: "Brikaya æрбавгæн", description: "аккаунтæй хъæздыг" },
  { locale: "ab", title: "Brikaya аҭыгара", description: "аккаунтда" },
  { locale: "ady", title: "Brikaya къутыгъэн", description: "аккаунтэнчъ" },
  { locale: "kab", title: "Sider Brikaya", description: "war amiḍan" },
  { locale: "tet", title: "Deskarga Brikaya", description: "laiha konta" },
  { locale: "bug", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "min", title: "Unduah Brikaya", description: "tanpa akun" },
  { locale: "ban", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "mad", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "bjn", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "hil", title: "I-download ang Brikaya", description: "wala account" },
  { locale: "pam", title: "I-download ing Brikaya", description: "alang account" },
  { locale: "bcl", title: "I-download an Brikaya", description: "mayong account" },
  { locale: "gor", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "mak", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "sas", title: "Unduh Brikaya", description: "tanpa akun" },
  { locale: "fy", title: "Download Brikaya", description: "sûnder akkount" },
  { locale: "fo", title: "Tak Brikaya niður", description: "uttan konto" },
  { locale: "gd", title: "Luchdaich sìos Brikaya", description: "gun chunntas" },
  { locale: "gv", title: "Lhiggey neose Brikaya", description: "gyn coontey" },
  { locale: "kw", title: "Deskarga Brikaya", description: "heb akont" },
  { locale: "se", title: "Viečča Brikaya", description: "konttu haga" },
  { locale: "kl", title: "Brikaya aajuk", description: "kontoqarani" },
  { locale: "iu", title: "Brikaya ᐱᔭᐅᔪᖅ", description: "ᐊᑎᓕᐅᖅᓯᒪᔪᖃᙱᑦᑐᖅ" },
  { locale: "cr", title: "Brikaya pīcih", description: "namōya account" },
  { locale: "oj", title: "Biindigedaa Brikaya", description: "gaawiin account" },
  { locale: "lkt", title: "Brikaya yúŋkȟaŋ", description: "akáuŋt šni" },
  { locale: "nv", title: "Brikaya yíníłta’", description: "account doo le’" },
  { locale: "ik", title: "Brikaya aitchuq", description: "account piqangitchuq" },
  { locale: "ch", title: "Na’huyong Brikaya", description: "sin cuenta" },
  { locale: "mh", title: "Aolep Brikaya", description: "ejjelok account" },
  { locale: "ty", title: "Faauta Brikaya", description: "aita pūkete" },
  { locale: "bi", title: "Daonlodem Brikaya", description: "no nidim akaon" },
  { locale: "na", title: "Download Brikaya", description: "account eko" },
  { locale: "gil", title: "Kaotinakoa Brikaya", description: "akea account" },
  { locale: "niu", title: "Download Brikaya", description: "nakai fai account" },
  { locale: "rar", title: "Tikiake Brikaya", description: "kāre e pūkete" },
  { locale: "pau", title: "Medechel Brikaya", description: "diak account" },
  { locale: "tpi", title: "Daunlodim Brikaya", description: "nogat akaun" },
  { locale: "ho", title: "Daunlodem Brikaya", description: "account lasi" },
] as const;
const DOWNLOADS_TITLE_FRAGMENT_BY_LOCALE: Record<AppLocale, string> = {
  "pt-BR": "Baixar Brikaya",
  en: "Download Brikaya",
  "es-419": "Descargar Brikaya",
  "en-IN": "Download Brikaya",
  "hi-IN": "Brikaya डाउनलोड",
  de: "Brikaya herunterladen",
  fr: "Télécharger Brikaya",
  it: "Scarica Brikaya",
  ja: "Brikayaをダウンロード",
  ko: "Brikaya 다운로드",
  id: "Unduh Brikaya",
  vi: "Tải Brikaya",
  fil: "I-download ang Brikaya",
  th: "ดาวน์โหลด Brikaya",
  "zh-CN": "下载 Brikaya",
  ar: "تنزيل Brikaya",
  ru: "Скачать Brikaya",
  tr: "Brikaya'yı indir",
  nl: "Brikaya downloaden",
  pl: "Pobierz Brikaya",
  uk: "Завантажити Brikaya",
  ms: "Muat turun Brikaya",
  "zh-TW": "下載 Brikaya",
  "pt-PT": "Descarregar Brikaya",
  "es-ES": "Descargar Brikaya",
  "en-GB": "Download Brikaya",
  "fr-CA": "Télécharger Brikaya",
  bn: "Brikaya ডাউনলোড করুন",
  ur: "Brikaya ڈاؤن لوڈ کریں",
  fa: "دانلود Brikaya",
  he: "הורדת Brikaya",
  ta: "Brikaya பதிவிறக்கவும்",
  te: "Brikaya డౌన్‌లోడ్ చేయండి",
  mr: "Brikaya डाउनलोड करा",
  gu: "Brikaya ડાઉનલોડ કરો",
  kn: "Brikaya ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
  ml: "Brikaya ഡൗൺലോഡ് ചെയ്യുക",
  pa: "Brikaya ਡਾਊਨਲੋਡ ਕਰੋ",
  el: "Λήψη Brikaya",
  sv: "Ladda ner Brikaya",
  da: "Download Brikaya",
  no: "Last ned Brikaya",
  fi: "Lataa Brikaya",
  cs: "Stáhnout Brikaya",
  ro: "Descarcă Brikaya",
  hu: "Brikaya letöltése",
  bg: "Изтеглете Brikaya",
  sk: "Stiahnuť Brikaya",
  sl: "Prenesi Brikaya",
  hr: "Preuzmi Brikaya",
  sr: "Преузми Brikaya",
  lt: "Atsisiųsti Brikaya",
  lv: "Lejupielādēt Brikaya",
  et: "Laadi alla Brikaya",
  sw: "Pakua Brikaya",
  af: "Laai Brikaya af",
  am: "Brikaya አውርድ",
  ka: "ჩამოტვირთეთ Brikaya",
  hy: "Ներբեռնել Brikaya",
  az: "Brikaya endirin",
  kk: "Brikaya жүктеп алу",
  uz: "Brikaya yuklab olish",
  ne: "Brikaya डाउनलोड गर्नुहोस्",
  si: "Brikaya බාගන්න",
  km: "ទាញយក Brikaya",
  lo: "ດາວໂຫຼດ Brikaya",
  my: "Brikaya ဒေါင်းလုဒ်လုပ်ရန်",
  is: "Sækja Brikaya",
  ga: "Íoslódáil Brikaya",
  cy: "Lawrlwytho Brikaya",
  mt: "Niżżel Brikaya",
  sq: "Shkarko Brikaya",
  mk: "Преземи Brikaya",
  bs: "Preuzmi Brikaya",
  mn: "Brikaya татаж авах",
  tg: "Боргирии Brikaya",
  ky: "Brikaya жүктөп алуу",
  tk: "Brikaya ýükläp al",
  be: "Спампаваць Brikaya",
  lb: "Brikaya eroflueden",
  eu: "Deskargatu Brikaya",
  ca: "Baixa Brikaya",
  gl: "Descargar Brikaya",
  oc: "Telecargar Brikaya",
  br: "Pellgargañ Brikaya",
  mi: "Tikiake Brikaya",
  sm: "La'u mai Brikaya",
  to: "Hiki mai Brikaya",
  fj: "Lavetaka Brikaya",
  mg: "Ampidino Brikaya",
  so: "Soo dejiso Brikaya",
  yo: "Gba Brikaya silẹ",
  ig: "Budata Brikaya",
  ha: "Zazzage Brikaya",
  zu: "Landa i-Brikaya",
  xh: "Khuphela i-Brikaya",
  st: "Khoasolla Brikaya",
  tn: "Folosa Brikaya",
  ts: "Dawuniloda Brikaya",
  ss: "Landa Brikaya",
  ve: "Dzhia Brikaya",
  nso: "Laolla Brikaya",
  rw: "Kuramo Brikaya",
  rn: "Manura Brikaya",
  ln: "Zwa Brikaya",
  lg: "Wanula Brikaya",
  ak: "Twe Brikaya",
  ee: "Ðe Brikaya",
  tw: "Twe Brikaya",
  sn: "Dhawunirodha Brikaya",
  ny: "Tsitsani Brikaya",
  wo: "Yebbi Brikaya",
  ff: "Aawto Brikaya",
  om: "Brikaya buusi",
  ti: "Brikaya ኣውርድ",
  qu: "Brikaya uraykachiy",
  ay: "Brikaya apaqaña",
  gn: "Emboguejy Brikaya",
  nah: "Temo Brikaya",
  ht: "Telechaje Brikaya",
  pap: "Deskargá Brikaya",
  jv: "Undhuh Brikaya",
  su: "Unduh Brikaya",
  ceb: "I-download ang Brikaya",
  ilo: "I-download ti Brikaya",
  war: "I-download an Brikaya",
  haw: "Hoʻoiho iā Brikaya",
  co: "Scaricà Brikaya",
  sc: "Iscàrriga Brikaya",
  fur: "Discjame Brikaya",
  rm: "Telechargiar Brikaya",
  lad: "Deskargar Brikaya",
  ast: "Baxar Brikaya",
  vec: "Descarga Brikaya",
  lmo: "Scarica Brikaya",
  pms: "Scaria Brikaya",
  nap: "Scarica Brikaya",
  scn: "Scàrrica Brikaya",
  sco: "Dounload Brikaya",
  ps: "Brikaya ډاونلوډ کړئ",
  sd: "Brikaya ڊائونلوڊ ڪريو",
  ks: "Brikaya ڈاؤنلوڈ کٔرِو",
  dv: "Brikaya ޑައުންލޯޑް ކުރޭ",
  ckb: "Brikaya دابەزێنە",
  ug: "Brikaya نى چۈشۈرۈڭ",
  yi: "אַראָפּלאָדן Brikaya",
  bo: "Brikaya ཕབ་ལེན",
  dz: "Brikaya ཕབ་ལེན",
  ku: "Brikaya daxîne",
  or: "Brikaya ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
  as: "Brikaya ডাউনল’ড কৰক",
  sa: "Brikaya अवतारयतु",
  mai: "Brikaya डाउनलोड करू",
  bho: "Brikaya डाउनलोड करीं",
  doi: "Brikaya डाउनलोड करो",
  mni: "Brikaya ডাউনলোড তৌ",
  kok: "Brikaya डाउनलोड करात",
  sat: "Brikaya ᱰᱟᱣᱱᱞᱳᱰ ᱢᱮ",
  lus: "Brikaya download rawh",
  brx: "Brikaya डाउनलोड खालाम",
  raj: "Brikaya डाउनलोड करो",
  hne: "Brikaya डाउनलोड करव",
  awa: "Brikaya डाउनलोड करा",
  ace: "Unduh Brikaya",
  bal: "Brikaya ڈاؤن لوڈ کن",
  chr: "Brikaya ᏫᎩᎶᏒᎢ",
  crh: "Brikaya indir",
  tt: "Brikaya йөкләү",
  ba: "Brikaya йөкләп алыу",
  cv: "Brikaya илсе",
  sah: "Brikaya хачайдаа",
  os: "Brikaya æрбавгæн",
  ab: "Brikaya аҭыгара",
  ady: "Brikaya къутыгъэн",
  kab: "Sider Brikaya",
  tet: "Deskarga Brikaya",
  bug: "Unduh Brikaya",
  min: "Unduah Brikaya",
  ban: "Unduh Brikaya",
  mad: "Unduh Brikaya",
  bjn: "Unduh Brikaya",
  hil: "I-download ang Brikaya",
  pam: "I-download ing Brikaya",
  bcl: "I-download an Brikaya",
  gor: "Unduh Brikaya",
  mak: "Unduh Brikaya",
  sas: "Unduh Brikaya",
  "fy": "Download Brikaya",
  "fo": "Tak Brikaya niður",
  "gd": "Luchdaich sìos Brikaya",
  "gv": "Lhiggey neose Brikaya",
  "kw": "Deskarga Brikaya",
  "se": "Viečča Brikaya",
  "kl": "Brikaya aajuk",
  "iu": "Brikaya ᐱᔭᐅᔪᖅ",
  "cr": "Brikaya pīcih",
  "oj": "Biindigedaa Brikaya",
  "lkt": "Brikaya yúŋkȟaŋ",
  "nv": "Brikaya yíníłta’",
  "ik": "Brikaya aitchuq",
  "ch": "Na’huyong Brikaya",
  "mh": "Aolep Brikaya",
  "ty": "Faauta Brikaya",
  "bi": "Daonlodem Brikaya",
  "na": "Download Brikaya",
  "gil": "Kaotinakoa Brikaya",
  "niu": "Download Brikaya",
  "rar": "Tikiake Brikaya",
  "pau": "Medechel Brikaya",
  "tpi": "Daunlodim Brikaya",
  "ho": "Daunlodem Brikaya",
};
const DOWNLOADS_DESCRIPTION_FRAGMENT_BY_LOCALE: Record<AppLocale, string> = {
  "pt-BR": "sem conta",
  en: "no account",
  "es-419": "sin cuenta",
  "en-IN": "no account",
  "hi-IN": "बिना खाते",
  de: "ohne Konto",
  fr: "sans compte",
  it: "senza account",
  ja: "アカウント不要",
  ko: "계정 없이",
  id: "tanpa akun",
  vi: "không cần tài khoản",
  fil: "walang account",
  th: "ไม่ต้องมีบัญชี",
  "zh-CN": "无需账号",
  ar: "بدون حساب",
  ru: "без аккаунта",
  tr: "hesap yok",
  nl: "geen account",
  pl: "bez konta",
  uk: "без облікового запису",
  ms: "tanpa akaun",
  "zh-TW": "無需帳號",
  "pt-PT": "sem conta",
  "es-ES": "sin cuenta",
  "en-GB": "no account",
  "fr-CA": "sans compte",
  bn: "অ্যাকাউন্ট ছাড়া",
  ur: "اکاؤنٹ کے بغیر",
  fa: "بدون حساب",
  he: "בלי חשבון",
  ta: "கணக்கு இல்லாமல்",
  te: "ఖాతా లేకుండా",
  mr: "खाते नसताना",
  gu: "ખાતા વગર",
  kn: "ಖಾತೆ ಇಲ್ಲದೆ",
  ml: "അക്കൗണ്ട് ഇല്ലാതെ",
  pa: "ਖਾਤੇ ਤੋਂ ਬਿਨਾਂ",
  el: "χωρίς λογαριασμό",
  sv: "utan konto",
  da: "uden konto",
  no: "uten konto",
  fi: "ilman tiliä",
  cs: "bez účtu",
  ro: "fără cont",
  hu: "fiók nélkül",
  bg: "без акаунт",
  sk: "bez účtu",
  sl: "brez računa",
  hr: "bez računa",
  sr: "без налога",
  lt: "be paskyros",
  lv: "bez konta",
  et: "ilma kontota",
  sw: "bila akaunti",
  af: "sonder rekening",
  am: "ያለ መለያ",
  ka: "ანგარიშის გარეშე",
  hy: "առանց հաշվի",
  az: "hesabsız",
  kk: "есептік жазбасыз",
  uz: "hisobsiz",
  ne: "खाता बिना",
  si: "ගිණුමක් නැතිව",
  km: "គ្មានគណនី",
  lo: "ບໍ່ຕ້ອງມີບັນຊີ",
  my: "အကောင့်မလို",
  is: "án reiknings",
  ga: "gan chuntas",
  cy: "heb gyfrif",
  mt: "mingħajr kont",
  sq: "pa llogari",
  mk: "без сметка",
  bs: "bez računa",
  mn: "бүртгэлгүй",
  tg: "бе ҳисоб",
  ky: "эсепсиз",
  tk: "hasapsyz",
  be: "без уліковага запісу",
  lb: "ouni Kont",
  eu: "konturik gabe",
  ca: "sense compte",
  gl: "sen conta",
  oc: "sens compte",
  br: "hep kont",
  mi: "kāore he pūkete",
  sm: "leai se teugatupe",
  to: "ʻikai ha ʻakauni",
  fj: "sega ni akaude",
  mg: "tsy mila kaonty",
  so: "xisaab la'aan",
  yo: "laisi akọọlẹ",
  ig: "enweghị akaụntụ",
  ha: "ba tare da asusu ba",
  zu: "ngaphandle kwe-akhawunti",
  xh: "ngaphandle kweakhawunti",
  st: "ntle le akhaonto",
  tn: "ntle le akhaonto",
  ts: "handle ka akhawunti",
  ss: "ngaphandle kwe-akhawunti",
  ve: "hu si na akhaunthu",
  nso: "ntle le akhaonto",
  rw: "nta konti",
  rn: "ata konti",
  ln: "konto te",
  lg: "awatali akawunti",
  ak: "konto biara nni ho",
  ee: "akɔntabubu manɔmee",
  tw: "konto biara nni ho",
  sn: "pasina account",
  ny: "popanda akaunti",
  wo: "amul kont",
  ff: "alaa konte",
  om: "herrega malee",
  ti: "ብዘይ ሒሳብ",
  qu: "mana yupayniyuq",
  ay: "jan cuenta",
  gn: "cuenta'ỹre",
  nah: "amo cuenta",
  ht: "san kont",
  pap: "sin cuenta",
  jv: "tanpa akun",
  su: "tanpa akun",
  ceb: "walay account",
  ilo: "awan account",
  war: "waray account",
  haw: "ʻaʻohe moʻokāki",
  co: "senza contu",
  sc: "chentza contu",
  fur: "cence account",
  rm: "senza conto",
  lad: "sin kuenta",
  ast: "ensin cuenta",
  vec: "senza account",
  lmo: "senza account",
  pms: "sensa account",
  nap: "senza cunto",
  scn: "senza cuntu",
  sco: "nae accoont",
  ps: "بې حسابه",
  sd: "اڪائونٽ کانسواءِ",
  ks: "اکاؤنٹ بغیر",
  dv: "އެކައުންޓް ނެތި",
  ckb: "بێ هەژمار",
  ug: "ھېساباتسىز",
  yi: "אָן חשבון",
  bo: "ཐོ་ཁོངས་མེད",
  dz: "རྩིས་ཁྲ་མེད",
  ku: "bê hesab",
  or: "ଖାତା ବିନା",
  as: "একাউন্ট নোহোৱাকৈ",
  sa: "लेखां विना",
  mai: "खाता बिना",
  bho: "खाता बिना",
  doi: "खाते बिना",
  mni: "একাউন্ট নত্তনা",
  kok: "खाते शिवाय",
  sat: "ᱟᱠᱟᱣᱱᱴ ᱵᱟᱝ",
  lus: "account tel lovin",
  brx: "एकाउन्ट गैयाबालानो",
  raj: "खातो बिना",
  hne: "खाता बिना",
  awa: "खाता बिना",
  ace: "tanpa akun",
  bal: "بے حساب",
  chr: "ᎠᎪᏩᏛᏗ ᎾᏍᎩ Ꮭ",
  crh: "hesapsız",
  tt: "аккаунтсыз",
  ba: "иҫәпһеҙ",
  cv: "аккаунтсӑр",
  sah: "аккаунт суох",
  os: "аккаунтæй хъæздыг",
  ab: "аккаунтда",
  ady: "аккаунтэнчъ",
  kab: "war amiḍan",
  tet: "laiha konta",
  bug: "tanpa akun",
  min: "tanpa akun",
  ban: "tanpa akun",
  mad: "tanpa akun",
  bjn: "tanpa akun",
  hil: "wala account",
  pam: "alang account",
  bcl: "mayong account",
  gor: "tanpa akun",
  mak: "tanpa akun",
  sas: "tanpa akun",
  "fy": "sûnder akkount",
  "fo": "uttan konto",
  "gd": "gun chunntas",
  "gv": "gyn coontey",
  "kw": "heb akont",
  "se": "konttu haga",
  "kl": "kontoqarani",
  "iu": "ᐊᑎᓕᐅᖅᓯᒪᔪᖃᙱᑦᑐᖅ",
  "cr": "namōya account",
  "oj": "gaawiin account",
  "lkt": "akáuŋt šni",
  "nv": "account doo le’",
  "ik": "account piqangitchuq",
  "ch": "sin cuenta",
  "mh": "ejjelok account",
  "ty": "aita pūkete",
  "bi": "no nidim akaon",
  "na": "account eko",
  "gil": "akea account",
  "niu": "nakai fai account",
  "rar": "kāre e pūkete",
  "pau": "diak account",
  "tpi": "nogat akaun",
  "ho": "account lasi",
};
const LOCALIZED_APPEARANCE_KEYS: TranslationKey[] = [
  "appearance.option.auto-by-level",
  "appearance.option.neon-arcade",
  "appearance.option.retro-default",
  "appearance.option.sunset-cabinet",
  "appearance.option.real-metro-night",
  "appearance.option.real-auto-garage",
  "appearance.option.real-bio-lab",
  "appearance.option.real-ancient-temple",
  "appearance.option.real-orbital-station",
  "appearance.option.real-metro-tunnel",
  "appearance.option.real-workshop-steel",
  "appearance.option.real-bio-lab-glass",
  "appearance.option.real-temple-stone",
  "appearance.option.real-orbital-deck",
  "appearance.option.block-pixel",
];
const USER_COPY_KEYS: TranslationKey[] = [
  "menu.tools",
  "menu.logs",
  "logs.close",
  "logs.title",
  "logs.allEvents",
  "logs.refresh",
  "logs.export",
  "logs.clear",
];
const TECHNICAL_COPY_PATTERN = /\b(logs?|tools?)\b/i;

function LocaleProbe() {
  const { locale, setLocale, setLocaleFromLocation, t } = useI18n();

  return (
    <div>
      <p>{locale}</p>
      <p>{t(TEST_TITLE_KEY)}</p>
      <button type="button" onClick={() => setLocale(SPANISH_LOCALE)}>
        {BUTTON_LABEL}
      </button>
      <button
        type="button"
        onClick={() => setLocaleFromLocation(GERMAN_LOCALE)}
      >
        location
      </button>
      <p>{t("controls.menu")}</p>
      <p>{t("appearance.option.lime-graphite")}</p>
      <p>{t("logs.speed.current")}</p>
    </div>
  );
}

function setNavigatorLocale(languages: readonly string[], language: string) {
  Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGES_PROPERTY, {
    configurable: true,
    value: languages,
  });
  Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGE_PROPERTY, {
    configurable: true,
    value: language,
  });
}

function setBrowserTimeZone(timeZone: string) {
  jest.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () =>
      ({
        resolvedOptions: () => ({ timeZone }),
      }) as Intl.DateTimeFormat,
  );
}

describe("i18n offline do Brikaya", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", TEST_ROUTE);
    window.localStorage.clear();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    setNavigatorLocale([PORTUGUESE_LOCALE], PORTUGUESE_LOCALE);
    setBrowserTimeZone("America/Sao_Paulo");
    (window.localStorage.setItem as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("expande o catálogo global para as prioridades P13-P15", () => {
    expect([...SUPPORTED_LOCALES]).toEqual([...EXPECTED_GLOBAL_LOCALES]);
  });

  it("publica metadados para todos os locales planejados", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const metadata = getSeoMetadata(locale);

      expect(metadata.title).toContain("Brikaya");
      expect(metadata.description.length).toBeGreaterThan(24);
      expect(metadata.canonicalUrl).toBe(getCanonicalUrl(locale));
      expect(getLocalePath(locale).startsWith(TEST_ROUTE)).toBe(true);
    }
  });

  it("publica SEO de downloads localizado para os novos idiomas de P13-P15", () => {
    for (const { locale, title, description } of NEW_DOWNLOADS_SEO_EXPECTATIONS) {
      const metadata = getSeoMetadata(locale as AppLocale, DOWNLOADS_ROUTE_PATH);

      expect(metadata.title).toContain(title);
      expect(metadata.description).toContain(description);
      expect(metadata.canonicalUrl).toBe(
        getCanonicalUrl(locale as AppLocale, DOWNLOADS_ROUTE_PATH),
      );
      if (!ENGLISH_LOCALES.has(locale as AppLocale)) {
        expect(metadata.title).not.toBe("Download Brikaya — free browser game");
        expect(metadata.description).not.toContain("no account, no payment");
      }
    }
  });

  it("publica SEO de downloads localizado para todos os locales planejados", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const metadata = getSeoMetadata(locale, DOWNLOADS_ROUTE_PATH);

      expect(metadata.title).toContain(DOWNLOADS_TITLE_FRAGMENT_BY_LOCALE[locale]);
      expect(metadata.description).toContain(
        DOWNLOADS_DESCRIPTION_FRAGMENT_BY_LOCALE[locale],
      );
      expect(metadata.canonicalUrl).toBe(
        getCanonicalUrl(locale, DOWNLOADS_ROUTE_PATH),
      );
      if (!ENGLISH_LOCALES.has(locale)) {
        expect(metadata.title).not.toBe("Download Brikaya — free browser game");
        expect(metadata.description).not.toContain("no account, no payment");
      }
    }
  });

  it("usa pt-BR por padrão e troca idioma com html lang, canonical e URL", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(PORTUGUESE_LOCALE)).toBeInTheDocument();
    expect(screen.getByText(LIME_GRAPHITE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(LOG_SPEED_LABEL)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(PORTUGUESE_LOCALE);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      CANONICAL_ROOT,
    );

    await user.click(screen.getByRole("button", { name: BUTTON_LABEL }));

    expect(screen.getByText(SPANISH_LOCALE)).toBeInTheDocument();
    expect(screen.getByText(MENU_LABEL)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(SPANISH_LOCALE);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      LOCALE_SOURCE_STORAGE_KEY,
      MANUAL_LOCALE_SOURCE,
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      SPANISH_CANONICAL,
    );
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
  });

  it("preserva parâmetros de campanha na navegação e mantém canonical limpo", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      null,
      "",
      `${TEST_ROUTE}${TEST_CAMPAIGN_SEARCH}`,
    );

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: BUTTON_LABEL }));

    expect(window.location.search).toBe(TEST_CAMPAIGN_SEARCH);
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      SPANISH_CANONICAL,
    );
  });

  it("reconhece locale zh-CN em rota pública localizada", () => {
    window.history.replaceState(null, "", getLocalePath(CHINESE_LOCALE));

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(CHINESE_LOCALE)).toBeInTheDocument();
    expect(screen.getByText(CHINESE_TITLE)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(CHINESE_LOCALE);
  });

  it("ativa direção RTL para rotas árabes, urdu e nova onda RTL sem inverter idiomas LTR", () => {
    window.history.replaceState(null, "", "/ar/");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("ar")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });



  it("ativa direção RTL para dhivehi como locale RTL da onda 163", () => {
    window.history.replaceState(null, "", "/dv/");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("dv")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("dv");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });

  it("ativa direção RTL para balúchi como locale RTL da onda 187", () => {
    window.history.replaceState(null, "", "/bal/");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("bal")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("bal");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });

  it("reconhece neerlandês do navegador antes do fuso horário", () => {
    setNavigatorLocale([DUTCH_BROWSER_LANGUAGE], DUTCH_BROWSER_LANGUAGE);
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("nl")).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath("nl" as AppLocale));
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
  });

  it("usa locale do navegador quando não há rota nem preferência salva", () => {
    setBrowserTimeZone(GERMANY_TIME_ZONE);
    setNavigatorLocale(["es-MX", "en-US"], "es-MX");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(SPANISH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
    expect(document.documentElement.lang).toBe(SPANISH_LOCALE);
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      LOCALE_STORAGE_KEY,
      SPANISH_LOCALE,
    );
  });

  it("registra idioma sugerido por região sem salvar coordenadas", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-04T10:00:00.000Z"));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "location" }));

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      LOCALE_DETECTION_STORAGE_KEY,
      JSON.stringify({
        version: "2026-07-04-location",
        locale: GERMAN_LOCALE,
        source: "location",
        detectedAt: "2026-07-04T10:00:00.000Z",
      }),
    );
    expect(
      JSON.stringify((window.localStorage.setItem as jest.Mock).mock.calls),
    ).not.toMatch(/latitude|longitude|-23\\.5505|-46\\.6333/i);
  });

  it("mantém preferência salva acima do idioma do navegador", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === LOCALE_STORAGE_KEY) return HINDI_LOCALE;
        if (key === LOCALE_SOURCE_STORAGE_KEY) return MANUAL_LOCALE_SOURCE;
        return null;
      },
    );
    setNavigatorLocale(["es-MX"], "es-MX");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(HINDI_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(HINDI_LOCALE));
  });

  it("ignora locale legado não manual e usa idioma atual do navegador", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => (key === LOCALE_STORAGE_KEY ? HINDI_LOCALE : null),
    );
    setNavigatorLocale([GERMAN_BROWSER_LANGUAGE], GERMAN_BROWSER_LANGUAGE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
  });

  it("avalia todos os idiomas do navegador antes de usar fuso horário", () => {
    setNavigatorLocale(
      [UNSUPPORTED_BROWSER_LANGUAGE, GERMAN_BROWSER_LANGUAGE],
      UNSUPPORTED_BROWSER_LANGUAGE,
    );
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
  });

  it("usa navigator.language quando navigator.languages não está disponível", () => {
    Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGES_PROPERTY, {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGE_PROPERTY, {
      configurable: true,
      value: FRENCH_BROWSER_LANGUAGE,
    });
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(FRENCH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(FRENCH_LOCALE));
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      LOCALE_STORAGE_KEY,
      FRENCH_LOCALE,
    );
  });

  it("usa fuso horário do navegador quando o idioma não é suportado", () => {
    setNavigatorLocale(
      [UNSUPPORTED_BROWSER_LANGUAGE],
      UNSUPPORTED_BROWSER_LANGUAGE,
    );
    setBrowserTimeZone(GERMANY_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
    expect(document.documentElement.lang).toBe(GERMAN_LOCALE);
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      LOCALE_STORAGE_KEY,
      GERMAN_LOCALE,
    );
  });

  it("ignora pt-BR legado automático e usa fuso horário quando não há preferência manual", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => (key === LOCALE_STORAGE_KEY ? PORTUGUESE_LOCALE : null),
    );
    setNavigatorLocale([UNSUPPORTED_BROWSER_LANGUAGE], UNSUPPORTED_BROWSER_LANGUAGE);
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(SPANISH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
  });

  it("mantém pt-BR manual acima do fuso horário", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === LOCALE_STORAGE_KEY) return PORTUGUESE_LOCALE;
        if (key === LOCALE_SOURCE_STORAGE_KEY) return MANUAL_LOCALE_SOURCE;
        return null;
      },
    );
    setNavigatorLocale([UNSUPPORTED_BROWSER_LANGUAGE], UNSUPPORTED_BROWSER_LANGUAGE);
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(PORTUGUESE_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(PORTUGUESE_LOCALE));
  });

  it("mapeia fuso horário da Índia para inglês indiano quando o idioma não é suportado", () => {
    setNavigatorLocale([UNSUPPORTED_BROWSER_LANGUAGE], UNSUPPORTED_BROWSER_LANGUAGE);
    setBrowserTimeZone(INDIA_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("en-IN")).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath("en-IN"));
  });

  it("mantém rota pública acima da preferência salva e do navegador", () => {
    window.history.replaceState(null, "", getLocalePath(ENGLISH_LOCALE));
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => (key === LOCALE_STORAGE_KEY ? HINDI_LOCALE : null),
    );
    setNavigatorLocale(["es-MX"], "es-MX");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(ENGLISH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(ENGLISH_LOCALE));
  });

  it("usa pt-BR quando idioma e fuso do navegador não são suportados", () => {
    setNavigatorLocale([UNSUPPORTED_BROWSER_LANGUAGE], UNSUPPORTED_BROWSER_LANGUAGE);
    setBrowserTimeZone(UNSUPPORTED_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(PORTUGUESE_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(PORTUGUESE_LOCALE));
  });

  it("mantém opções de aparência localizadas sem fallback visual em inglês", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (ENGLISH_LOCALES.has(locale)) continue;

      for (const key of LOCALIZED_APPEARANCE_KEYS) {
        expect(I18N_MESSAGES[locale][key]).toBeTruthy();
        expect(I18N_MESSAGES[locale][key]).not.toBe(EN_MESSAGES[key]);
      }
    }
  });

  it("mantém rótulos visíveis de histórico em linguagem de produto", () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of USER_COPY_KEYS) {
        expect(I18N_MESSAGES[locale][key]).toBeTruthy();
        expect(I18N_MESSAGES[locale][key]).not.toMatch(TECHNICAL_COPY_PATTERN);
      }
    }
  });
});
