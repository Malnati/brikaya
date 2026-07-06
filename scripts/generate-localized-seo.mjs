// scripts/generate-localized-seo.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const DIST_DIR = 'dist';
const INDEX_FILE = 'index.html';
const SITEMAP_FILE = 'sitemap.xml';
const ROBOTS_FILE = 'robots.txt';
const CANONICAL_ORIGIN = 'https://brikaya.com';
const DEFAULT_LOCALE = 'pt-BR';
const LASTMOD = '2026-07-06';
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const HOME_ROUTE_PATH = '/';
const DOWNLOADS_ROUTE_PATH = '/downloads/';
const LOCALIZED_ROUTES = [HOME_ROUTE_PATH, DOWNLOADS_ROUTE_PATH];
const STATIC_PUBLIC_PATHS = ['/privacy/', '/terms/'];
const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he']);

const LOCALES = [
  'pt-BR',
  'en',
  'es-419',
  'en-IN',
  'hi-IN',
  'de',
  'fr',
  'it',
  'ja',
  'ko',
  'id',
  'vi',
  'fil',
  'th',
  'zh-CN',
  'ar',
  'ru',
  'tr',
  'nl',
  'pl',
  'uk',
  'ms',
  'zh-TW',
  'pt-PT',
  'es-ES',
  'en-GB',
  'fr-CA',
  'bn',
  'ur',
  'fa',
  'he',
  'ta',
  'te',
  'mr',
  'gu',
  'kn',
  'ml',
  'pa',
  'el',
  'sv',
  'da',
  'no',
  'fi',
  'cs',
  'ro',
  'hu',
  'bg',
  'sk',
  'sl',
  'hr',
  'sr',
  'lt',
  'lv',
  'et',
  'sw',
  'af',
  'am',
  'ka',
  'hy',
  'az',
  'kk',
  'uz',
  'ne',
  'si',
  'km',
  'lo',
  'my',
  'is',
  'ga',
  'cy',
  'mt',
  'sq',
  'mk',
  'bs',
  'mn',
  'tg',
  'ky',
  'tk',
  'be',
  'lb',
  'eu',
  'ca',
  'gl',
  'oc',
  'br',
  'mi',
  'sm',
  'to',
  'fj',
  'mg',
  'so',
  'yo',
  'ig',
  'ha',
  'zu',
  'xh',
  'st',
  'tn',
  'ts',
  'ss',
  've',
  'nso',
  'rw',
  'rn',
  'ln',
  'lg',
  'ak',
  'ee',
  'tw',
  'sn',
  'ny',
  'wo',
  'ff',
  'om',
  'ti',
];
const SEO = {
  'pt-BR': {
    title: 'Brikaya — arcade de quebrar blocos',
    description: 'Jogue Brikaya, um arcade gratuito de quebrar blocos no navegador, com progresso salvo no seu aparelho e partida disponível mesmo sem conexão depois do primeiro acesso.',
    ogDescription: 'Destrua blocos, avance fases e jogue no navegador com progresso salvo no seu aparelho.',
  },
  en: {
    title: 'Brikaya — block breaker arcade',
    description: 'Play Brikaya, a free block breaker arcade in your browser, with progress saved on your device and offline play after the first visit.',
    ogDescription: 'Break blocks, advance levels, and play in your browser with progress saved on your device.',
  },
  'es-419': {
    title: 'Brikaya — arcade de romper bloques',
    description: 'Juega Brikaya, un arcade gratuito de romper bloques en el navegador, con progreso guardado en tu dispositivo y juego sin conexión después del primer acceso.',
    ogDescription: 'Rompe bloques, avanza niveles y juega en el navegador con progreso guardado en tu dispositivo.',
  },
  'en-IN': {
    title: 'Brikaya — block breaker arcade for India',
    description: 'Play Brikaya in your browser, a free block breaker arcade with device-saved progress and offline play after the first visit.',
    ogDescription: 'Break blocks, clear levels, and keep playing in your browser with progress saved on your device.',
  },
  'hi-IN': {
    title: 'Brikaya — ब्लॉक ब्रेकर आर्केड',
    description: 'ब्राउज़र में Brikaya खेलें: मुफ्त ब्लॉक ब्रेकर आर्केड, प्रगति आपके डिवाइस पर सेव और पहले उपयोग के बाद ऑफ़लाइन खेल।',
    ogDescription: 'ब्लॉक तोड़ें, लेवल बढ़ाएँ और ब्राउज़र में खेलें, प्रगति आपके डिवाइस पर सेव रहती है।',
  },
  de: {
    title: 'Brikaya — Blockbreaker-Arcade',
    description: 'Spiele Brikaya, ein kostenloses Blockbreaker-Arcade im Browser, mit lokal gespeichertem Fortschritt und Offline-Spiel nach dem ersten Besuch.',
    ogDescription: 'Zerstöre Blöcke, steige Level auf und spiele im Browser mit lokal gespeichertem Fortschritt.',
  },
  fr: {
    title: 'Brikaya — arcade casse-briques',
    description: 'Jouez à Brikaya, un arcade casse-briques gratuit dans le navigateur, avec progression enregistrée sur votre appareil et jeu hors connexion après la première visite.',
    ogDescription: "Cassez des blocs, progressez dans les niveaux et jouez dans le navigateur avec votre progression enregistrée sur l\'appareil.",
  },
  it: {
    title: 'Brikaya — arcade rompi blocchi',
    description: 'Gioca a Brikaya, un arcade gratuito rompi blocchi nel browser, con progressi salvati sul dispositivo e gioco offline dopo il primo accesso.',
    ogDescription: 'Rompi blocchi, supera livelli e gioca nel browser con progressi salvati sul dispositivo.',
  },
  ja: {
    title: 'Brikaya — ブロック崩しアーケード',
    description: 'ブラウザで無料のブロック崩しアーケード Brikaya をプレイ。進行状況は端末に保存され、初回アクセス後はオフラインでも遊べます。',
    ogDescription: 'ブロックを壊し、レベルを進め、進行状況を端末に保存してブラウザで遊べます。',
  },
  ko: {
    title: 'Brikaya — 블록 브레이커 아케이드',
    description: '브라우저에서 무료 블록 브레이커 아케이드 Brikaya를 플레이하세요. 진행 상황은 기기에 저장되고 첫 방문 후 오프라인으로도 플레이할 수 있습니다.',
    ogDescription: '블록을 깨고 레벨을 진행하며 기기에 저장된 진행 상황으로 브라우저에서 플레이하세요.',
  },
  id: {
    title: 'Brikaya — arkade pemecah blok',
    description: 'Mainkan Brikaya, arkade pemecah blok gratis di browser, dengan progres tersimpan di perangkat dan permainan offline setelah kunjungan pertama.',
    ogDescription: 'Pecahkan blok, naik level, dan main di browser dengan progres tersimpan di perangkat.',
  },
  vi: {
    title: 'Brikaya — arcade phá khối',
    description: 'Chơi Brikaya, trò arcade phá khối miễn phí trên trình duyệt, lưu tiến trình trên thiết bị và chơi ngoại tuyến sau lần truy cập đầu tiên.',
    ogDescription: 'Phá khối, vượt màn và chơi trong trình duyệt với tiến trình lưu trên thiết bị.',
  },
  fil: {
    title: 'Brikaya — block breaker arcade',
    description: 'Maglaro ng Brikaya, libreng block breaker arcade sa browser, may progreso na naka-save sa device at puwedeng laruin offline pagkatapos ng unang bisita.',
    ogDescription: 'Basagin ang blocks, umakyat ng antas, at maglaro sa browser habang naka-save ang progreso sa device.',
  },
  th: {
    title: 'Brikaya — อาร์เคดทำลายบล็อก',
    description: 'เล่น Brikaya เกมอาร์เคดทำลายบล็อกฟรีบนเบราว์เซอร์ บันทึกความคืบหน้าในอุปกรณ์และเล่นออฟไลน์ได้หลังเข้าใช้งานครั้งแรก',
    ogDescription: 'ทำลายบล็อก ผ่านด่าน และเล่นในเบราว์เซอร์พร้อมบันทึกความคืบหน้าไว้ในอุปกรณ์',
  },
  'zh-CN': {
    title: 'Brikaya — 打砖块街机',
    description: '在浏览器中游玩免费的打砖块街机 Brikaya，进度保存在你的设备上，首次访问后可离线游玩。',
    ogDescription: '击碎砖块、推进关卡，并在浏览器中保存进度继续游玩。',
  },


  ar: {
    title: 'Brikaya — أركيد كسر الكتل',
    description: 'العب Brikaya، لعبة أركيد مجانية لكسر الكتل في المتصفح، مع حفظ التقدم على جهازك واللعب دون اتصال بعد أول زيارة.',
    ogDescription: 'اكسر الكتل وتقدم في المستويات والعب في المتصفح مع حفظ التقدم على جهازك.',
  },
  ru: {
    title: 'Brikaya — аркада с разбиванием блоков',
    description: 'Играйте в Brikaya, бесплатную браузерную аркаду с разбиванием блоков, с сохранением прогресса на устройстве и офлайн-игрой после первого визита.',
    ogDescription: 'Разбивайте блоки, проходите уровни и играйте в браузере с прогрессом на устройстве.',
  },
  tr: {
    title: 'Brikaya — blok kırma arcade',
    description: 'Brikaya\'yı tarayıcıda ücretsiz blok kırma arcade olarak oynayın; ilerleme cihazınızda kalır ve ilk ziyaretten sonra çevrimdışı oynanır.',
    ogDescription: 'Blokları kırın, seviyeleri geçin ve ilerleme cihazınızda kalırken tarayıcıda oynayın.',
  },
  nl: {
    title: 'Brikaya — blokbreker-arcade',
    description: 'Speel Brikaya, een gratis blokbreker-arcade in de browser, met voortgang op je apparaat en offline spelen na het eerste bezoek.',
    ogDescription: 'Breek blokken, haal levels en speel in de browser met voortgang op je apparaat.',
  },
  pl: {
    title: 'Brikaya — arcade rozbijania bloków',
    description: 'Graj w Brikaya, darmową przeglądarkową grę arcade do rozbijania bloków, z postępem zapisanym na urządzeniu i grą offline po pierwszej wizycie.',
    ogDescription: 'Rozbijaj bloki, przechodź poziomy i graj w przeglądarce z postępem na urządzeniu.',
  },
  uk: {
    title: 'Brikaya — аркада розбивання блоків',
    description: 'Грайте в Brikaya, безкоштовну браузерну аркаду для розбивання блоків, із прогресом на пристрої та офлайн-грою після першого відвідування.',
    ogDescription: 'Розбивайте блоки, проходьте рівні та грайте в браузері з прогресом на пристрої.',
  },
  ms: {
    title: 'Brikaya — arked pemecah blok',
    description: 'Main Brikaya, arked pemecah blok percuma dalam pelayar, dengan kemajuan disimpan pada peranti dan permainan luar talian selepas lawatan pertama.',
    ogDescription: 'Pecahkan blok, mara tahap dan main dalam pelayar dengan kemajuan pada peranti.',
  },
  'zh-TW': {
    title: 'Brikaya — 打磚塊街機',
    description: '在瀏覽器中遊玩免費的打磚塊街機 Brikaya，進度保存在你的裝置上，首次造訪後可離線遊玩。',
    ogDescription: '擊碎磚塊、推進關卡，並在瀏覽器中保存進度繼續遊玩。',
  },
  'pt-PT': {
    title: 'Brikaya — arcade de partir blocos',
    description: 'Jogue Brikaya, um arcade gratuito de partir blocos no navegador, com progresso guardado no seu aparelho e jogo offline após o primeiro acesso.',
    ogDescription: 'Parta blocos, avance níveis e jogue no navegador com progresso guardado no aparelho.',
  },
  'es-ES': {
    title: 'Brikaya — arcade de romper bloques',
    description: 'Juega Brikaya, un arcade gratuito de romper bloques en el navegador, con progreso guardado en tu dispositivo y juego sin conexión después del primer acceso.',
    ogDescription: 'Rompe bloques, avanza niveles y juega en el navegador con progreso guardado en tu dispositivo.',
  },
  'en-GB': {
    title: 'Brikaya — block breaker arcade',
    description: 'Play Brikaya, a free block breaker arcade in your browser, with progress saved on your device and offline play after the first visit.',
    ogDescription: 'Break blocks, advance levels, and play in your browser with progress saved on your device.',
  },
  'fr-CA': {
    title: 'Brikaya — arcade casse-briques',
    description: 'Jouez à Brikaya, un arcade casse-briques gratuit dans le navigateur, avec progression enregistrée sur votre appareil et jeu hors connexion après la première visite.',
    ogDescription: 'Cassez des blocs, progressez dans les niveaux et jouez dans le navigateur avec votre progression enregistrée sur l\'appareil.',
  },
  bn: {
    title: 'Brikaya — ব্লক ব্রেকার আর্কেড',
    description: 'ব্রাউজারে Brikaya খেলুন, একটি বিনামূল্যের ব্লক ব্রেকার আর্কেড; অগ্রগতি আপনার ডিভাইসে থাকে এবং প্রথম ভিজিটের পরে অফলাইনে খেলা যায়।',
    ogDescription: 'ব্লক ভাঙুন, লেভেল এগিয়ে নিন এবং ডিভাইসে অগ্রগতি রেখে ব্রাউজারে খেলুন।',
  },
  ur: {
    title: 'Brikaya — بلاک بریکر آرکیڈ',
    description: 'براؤزر میں Brikaya کھیلیں، ایک مفت بلاک بریکر آرکیڈ؛ پیش رفت آپ کے آلے پر محفوظ رہتی ہے اور پہلی بار کے بعد آف لائن کھیل ممکن ہے۔',
    ogDescription: 'بلاکس توڑیں، لیول آگے بڑھائیں اور آلے پر محفوظ پیش رفت کے ساتھ براؤزر میں کھیلیں۔',
  },
  'fa': {
    title: 'Brikaya — آرکید شکستن بلوک',
    description: 'Brikaya را در مرورگر بازی کنید؛ یک آرکید رایگان شکستن بلوک با پیشرفت ذخیره‌شده روی دستگاه و بازی آفلاین پس از اولین بازدید.',
    ogDescription: 'بلوک‌ها را بشکنید، مرحله‌ها را پیش ببرید و در مرورگر با پیشرفت ذخیره‌شده روی دستگاه بازی کنید.',
  },
  'he': {
    title: 'Brikaya — ארקייד שבירת בלוקים',
    description: 'שחקו ב־Brikaya בדפדפן: ארקייד שבירת בלוקים חינמי, עם התקדמות שנשמרת במכשיר ומשחק בלי חיבור אחרי הביקור הראשון.',
    ogDescription: 'שברו בלוקים, התקדמו בשלבים ושחקו בדפדפן עם התקדמות שנשמרת במכשיר.',
  },
  ta: {
    title: 'Brikaya — கட்டங்களை உடைக்கும் அர்கேட்',
    description: 'உங்கள் உலாவியில் இலவச கட்டம் உடைக்கும் அர்கேட் Brikaya விளையாடுங்கள்; முன்னேற்றம் சாதனத்தில் சேமிக்கப்படும், முதல் வருகைக்குப் பிறகு ஆஃப்லைனிலும் விளையாடலாம்.',
    ogDescription: 'கட்டங்களை உடைக்கவும், நிலைகளை முன்னேற்றவும், சாதனத்தில் முன்னேற்றத்துடன் உலாவியில் விளையாடவும்.',
  },
  'mr': {
    title: "Brikaya — ब्लॉक ब्रेकर आर्केड",
    description: "ब्राउझरमध्ये Brikaya खेळा: मोफत ब्लॉक ब्रेकर आर्केड, प्रगती तुमच्या डिव्हाइसवर जतन होते आणि पहिल्या भेटीनंतर ऑफलाइन खेळता येते.",
    ogDescription: "ब्लॉक फोडा, पातळ्या पुढे न्या आणि प्रगती डिव्हाइसवर ठेवून ब्राउझरमध्ये खेळा.",
  },
  'gu': {
    title: "Brikaya — બ્લોક બ્રેકર આર્કેડ",
    description: "બ્રાઉઝરમાં Brikaya રમો: મફત બ્લોક બ્રેકર આર્કેડ, પ્રગતિ તમારા ઉપકરણમાં સાચવાય છે અને પ્રથમ મુલાકાત પછી ઑફલાઇન રમાય છે.",
    ogDescription: "બ્લોક તોડો, સ્તર આગળ વધારો અને ઉપકરણમાં સાચવાયેલી પ્રગતિ સાથે બ્રાઉઝરમાં રમો.",
  },
  'kn': {
    title: "Brikaya — ಬ್ಲಾಕ್ ಬ್ರೇಕರ್ ಆರ್ಕೇಡ್",
    description: "ಬ್ರೌಸರ್‌ನಲ್ಲಿ Brikaya ಆಡಿ: ಉಚಿತ ಬ್ಲಾಕ್ ಬ್ರೇಕರ್ ಆರ್ಕೇಡ್, ಪ್ರಗತಿ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಉಳಿಯುತ್ತದೆ ಮತ್ತು ಮೊದಲ ಭೇಟಿ ನಂತರ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಆಡಬಹುದು.",
    ogDescription: "ಬ್ಲಾಕ್‌ಗಳನ್ನು ಒಡೆಯಿರಿ, ಹಂತಗಳನ್ನು ಮುಂದಕ್ಕೆ ತೆಗೆದುಕೊಂಡು ಸಾಧನದಲ್ಲಿ ಉಳಿದ ಪ್ರಗತಿಯೊಂದಿಗೆ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಆಡಿ.",
  },
  'ml': {
    title: "Brikaya — ബ്ലോക്ക് ബ്രേക്കർ ആർക്കേഡ്",
    description: "ബ്രൗസറിൽ Brikaya കളിക്കൂ: സൗജന്യ ബ്ലോക്ക് ബ്രേക്കർ ആർക്കേഡ്, പുരോഗതി നിങ്ങളുടെ ഉപകരണത്തിൽ സൂക്ഷിക്കും; ആദ്യ സന്ദർശനത്തിന് ശേഷം ഓഫ്‌ലൈൻ കളിക്കാം.",
    ogDescription: "ബ്ലോക്കുകൾ തകർക്കുക, നിലകൾ മുന്നോട്ട് കൊണ്ടുപോകുക, ഉപകരണത്തിൽ സൂക്ഷിച്ച പുരോഗതിയോടെ ബ്രൗസറിൽ കളിക്കുക.",
  },
  'pa': {
    title: "Brikaya — ਬਲਾਕ ਬ੍ਰੇਕਰ ਆਰਕੇਡ",
    description: "ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ Brikaya ਖੇਡੋ: ਮੁਫ਼ਤ ਬਲਾਕ ਬ੍ਰੇਕਰ ਆਰਕੇਡ, ਤਰੱਕੀ ਤੁਹਾਡੇ ਡਿਵਾਈਸ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ ਅਤੇ ਪਹਿਲੀ ਵਾਰ ਖੋਲ੍ਹਣ ਤੋਂ ਬਾਅਦ ਆਫਲਾਈਨ ਖੇਡ ਸਕਦੇ ਹੋ।",
    ogDescription: "ਬਲਾਕ ਤੋੜੋ, ਲੈਵਲ ਅੱਗੇ ਵਧਾਓ ਅਤੇ ਡਿਵਾਈਸ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਤਰੱਕੀ ਨਾਲ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਖੇਡੋ।",
  },
  'el': {
    title: "Brikaya — arcade σπασίματος μπλοκ",
    description: "Παίξτε Brikaya στο πρόγραμμα περιήγησης: δωρεάν arcade σπασίματος μπλοκ, με πρόοδο αποθηκευμένη στη συσκευή και παιχνίδι εκτός σύνδεσης μετά την πρώτη επίσκεψη.",
    ogDescription: "Σπάστε μπλοκ, προχωρήστε επίπεδα και παίξτε στο πρόγραμμα περιήγησης με πρόοδο στη συσκευή.",
  },
  'sv': {
    title: "Brikaya — blockbrytararkad",
    description: "Spela Brikaya i webbläsaren: ett gratis blockbrytarspel med framsteg sparade på enheten och offlinespel efter första besöket.",
    ogDescription: "Bryt block, gå vidare i nivåer och spela i webbläsaren med framsteg på enheten.",
  },
  'da': {
    title: "Brikaya — blokbryder-arkade",
    description: "Spil Brikaya i browseren: et gratis blokbryder-arkadespil med fremskridt gemt på din enhed og offline spil efter første besøg.",
    ogDescription: "Knus blokke, gå videre gennem baner og spil i browseren med fremskridt på enheden.",
  },
  'no': {
    title: "Brikaya — blokkbrekker-arkade",
    description: "Spill Brikaya i nettleseren: et gratis blokkbrekker-arkadespill med fremdrift lagret på enheten og offline spill etter første besøk.",
    ogDescription: "Knus blokker, gå videre i nivåer og spill i nettleseren med fremdrift på enheten.",
  },
  'fi': {
    title: "Brikaya — palikanmurtaja-arcade",
    description: "Pelaa Brikayaa selaimessa: ilmainen palikanmurtaja-arcade, jossa edistyminen tallentuu laitteellesi ja peli toimii offline-tilassa ensimmäisen käynnin jälkeen.",
    ogDescription: "Riko palikoita, etene tasoilla ja pelaa selaimessa laitteelle tallennetulla edistymisellä.",
  },
  'cs': {
    title: "Brikaya — arkáda bourání bloků",
    description: "Nainstalujte nebo hrajte Brikaya zdarma, bez účtu a bez platby; postup zůstává v zařízení a po první návštěvě lze hrát offline.",
    ogDescription: "Brikaya — arkáda bourání bloků",
  },
  'ro': {
    title: "Brikaya — arcade de spart blocuri",
    description: "Instalează sau joacă Brikaya gratuit, fără cont și fără plată; progresul rămâne pe dispozitiv și poți juca offline după prima vizită.",
    ogDescription: "Brikaya — arcade de spart blocuri",
  },
  'hu': {
    title: "Brikaya — blokktörő arcade",
    description: "Telepítsd vagy játszd a Brikaya játékot ingyen, fiók és fizetés nélkül; a haladás az eszközön marad, és az első látogatás után offline is játszható.",
    ogDescription: "Brikaya — blokktörő arcade",
  },
  'bg': {
    title: "Brikaya — аркада за разбиване на блокове",
    description: "Инсталирайте или играйте Brikaya безплатно, без акаунт и без плащане; напредъкът остава на устройството и след първото посещение играта работи офлайн.",
    ogDescription: "Brikaya — аркада за разбиване на блокове",
  },
  'sk': {
    title: "Brikaya — arkáda lámania blokov",
    description: "Nainštalujte alebo hrajte Brikaya zadarmo, bez účtu a bez platby; postup zostáva v zariadení a po prvej návšteve možno hrať offline.",
    ogDescription: "Brikaya — arkáda lámania blokov",
  },
  'sl': {
    title: "Brikaya — arkada razbijanja blokov",
    description: "Namestite ali igrajte Brikaya brezplačno, brez računa in brez plačila; napredek ostane v napravi, po prvem obisku pa je igra na voljo brez povezave.",
    ogDescription: "Brikaya — arkada razbijanja blokov",
  },
  'hr': {
    title: "Brikaya — arkadna igra razbijanja blokova",
    description: "Instaliraj ili igraj Brikaya besplatno, bez računa i bez plaćanja; napredak ostaje na uređaju, a nakon prvog posjeta možeš igrati offline.",
    ogDescription: "Brikaya — arkadna igra razbijanja blokova",
  },
  'sr': {
    title: "Brikaya — аркада разбијања блокова",
    description: "Инсталирајте или играјте Brikaya бесплатно, без налога и без плаћања; напредак остаје на уређају и после прве посете можете играти офлајн.",
    ogDescription: "Brikaya — аркада разбијања блокова",
  },
  'lt': {
    title: "Brikaya — blokų daužymo arkada",
    description: "Įdiekite arba žaiskite Brikaya nemokamai, be paskyros ir be mokėjimo; pažanga lieka įrenginyje, o po pirmo apsilankymo galima žaisti neprisijungus.",
    ogDescription: "Brikaya — blokų daužymo arkada",
  },
  'lv': {
    title: "Brikaya — bloku laušanas arkāde",
    description: "Instalējiet vai spēlējiet Brikaya bez maksas, bez konta un bez maksājuma; progress paliek ierīcē, un pēc pirmā apmeklējuma var spēlēt bezsaistē.",
    ogDescription: "Brikaya — bloku laušanas arkāde",
  },
  'et': {
    title: "Brikaya — plokimurdmise arkaad",
    description: "Paigalda või mängi Brikayat tasuta, ilma kontota ja makseta; edenemine jääb seadmesse ning pärast esimest külastust saab mängida võrguühenduseta.",
    ogDescription: "Brikaya — plokimurdmise arkaad",
  },
  'sw': {
    title: "Brikaya — arkedi ya kuvunja vizuizi",
    description: "Sakinisha au cheza Brikaya bila malipo, bila akaunti na bila malipo yoyote; maendeleo hubaki kwenye kifaa na unaweza kucheza nje ya mtandao baada ya ziara ya kwanza.",
    ogDescription: "Brikaya — arkedi ya kuvunja vizuizi",
  },
  'af': {
    title: "Brikaya — blokbreker-arkade",
    description: "Installeer of speel Brikaya gratis, sonder rekening en sonder betaling; vordering bly op die toestel en ná die eerste besoek kan jy vanlyn speel.",
    ogDescription: "Brikaya — blokbreker-arkade",
  },
  'am': {
    title: "Brikaya — ብሎክ ሰባሪ አርኬድ",
    description: "Brikayaን በነፃ ይጫኑ ወይም ይጫወቱ፣ ያለ መለያ እና ያለ ክፍያ፤ ሂደት በመሣሪያው ላይ ይቀመጣል እና ከመጀመሪያ ጉብኝት በኋላ ከመስመር ውጭ መጫወት ይቻላል።",
    ogDescription: "Brikaya — ብሎክ ሰባሪ አርኬድ",
  },
  'ka': {
    title: "Brikaya — ბლოკების დამტვრევის არკადა",
    description: "დააყენეთ ან ითამაშეთ Brikaya უფასოდ, ანგარიშისა და გადახდის გარეშე; პროგრესი რჩება მოწყობილობაზე და პირველი ვიზიტის შემდეგ თამაში შესაძლებელია ოფლაინ.",
    ogDescription: "Brikaya — ბლოკების დამტვრევის არკადა",
  },
  'hy': {
    title: "Brikaya — բլոկներ կոտրելու արկադ",
    description: "Տեղադրեք կամ խաղացեք Brikaya անվճար, առանց հաշվի և առանց վճարման․ առաջընթացը մնում է սարքում, իսկ առաջին այցելությունից հետո հնարավոր է խաղալ անցանց։",
    ogDescription: "Brikaya — բլոկներ կոտրելու արկադ",
  },
  'az': {
    title: "Brikaya — blok qırma arkadası",
    description: "Brikaya-nı pulsuz quraşdırın və ya oynayın, hesab və ödəniş olmadan; irəliləyiş cihazda qalır və ilk ziyarətdən sonra oflayn oynamaq mümkündür.",
    ogDescription: "Brikaya — blok qırma arkadası",
  },
  'kk': {
    title: "Brikaya — блок бұзу аркадасы",
    description: "Brikaya ойынын тегін орнатыңыз немесе ойнаңыз, есептік жазбасыз және төлемсіз; прогресс құрылғыда қалады және бірінші кіргеннен кейін офлайн ойнауға болады.",
    ogDescription: "Brikaya — блок бұзу аркадасы",
  },
  'uz': {
    title: "Brikaya — blok sindirish arkadasi",
    description: "Brikaya-ni bepul o‘rnating yoki o‘ynang, hisob va to‘lovsiz; jarayon qurilmada qoladi va birinchi tashrifdan keyin oflayn o‘ynash mumkin.",
    ogDescription: "Brikaya — blok sindirish arkadasi",
  },
  'ne': {
    title: "Brikaya — ब्लक ब्रेकर आर्केड",
    description: "Brikaya निःशुल्क स्थापना गर्नुहोस् वा खेल्नुहोस्, खाता बिना र भुक्तानी बिना; प्रगति उपकरणमै रहन्छ र पहिलो भ्रमणपछि अफलाइन खेल्न सकिन्छ।",
    ogDescription: "Brikaya — ब्लक ब्रेकर आर्केड",
  },
  'si': {
    title: "Brikaya — බ්ලොක් බ්‍රේකර් ආකේඩ්",
    description: "Brikaya නොමිලේ ස්ථාපනය කරන්න හෝ ක්‍රීඩා කරන්න, ගිණුමක් නැතිව සහ ගෙවීමකින් තොරව; ප්‍රගතිය උපාංගයේම රැඳේ සහ පළමු පිවිසුමෙන් පසු නොබැඳිව ක්‍රීඩා කළ හැක.",
    ogDescription: "Brikaya — බ්ලොක් බ්‍රේකර් ආකේඩ්",
  },
  'km': {
    title: "Brikaya — អាកាដបំបែកប្លុក",
    description: "ដំឡើង ឬលេង Brikaya ដោយឥតគិតថ្លៃ គ្មានគណនី និងគ្មានការបង់ប្រាក់; វឌ្ឍនភាពនៅលើឧបករណ៍ ហើយអាចលេងក្រៅបណ្ដាញបន្ទាប់ពីចូលមើលដំបូង។",
    ogDescription: "Brikaya — អាកាដបំបែកប្លុក",
  },
  'lo': {
    title: "Brikaya — ອາເຄດແຕກບລັອກ",
    description: "ຕິດຕັ້ງ ຫຼື ຫຼິ້ນ Brikaya ຟຣີ, ບໍ່ຕ້ອງມີບັນຊີ ແລະ ບໍ່ມີການຈ່າຍເງິນ; ຄວາມຄືບໜ້າຢູ່ໃນອຸປະກອນ ແລະ ຫຼິ້ນອອຟລາຍໄດ້ຫຼັງການເຂົ້າຄັ້ງທໍາອິດ.",
    ogDescription: "Brikaya — ອາເຄດແຕກບລັອກ",
  },
  'my': {
    title: "Brikaya — ဘလောက်ဖျက် arcade",
    description: "Brikaya ကို အခမဲ့ တပ်ဆင်ပါ သို့မဟုတ် ကစားပါ၊ အကောင့်မလို၊ ငွေပေးချေမှုမလို; တိုးတက်မှုသည် စက်ပေါ်တွင် ಉಳಿದು ပထမဆုံးဝင်ရောက်ပြီးနောက် အော့ဖ်လိုင်းကစားနိုင်သည်။",
    ogDescription: "Brikaya — ဘလောက်ဖျက် arcade",
  },
  te: {
    title: 'Brikaya — బ్లాక్ బ్రేకర్ ఆర్కేడ్',
    description: 'బ్రౌజర్‌లో Brikaya అనే ఉచిత బ్లాక్ బ్రేకర్ ఆర్కేడ్ ఆడండి; పురోగతి మీ పరికరంలోనే ఉంటుంది, మొదటి సందర్శన తర్వాత ఆఫ్‌లైన్‌లో ఆడవచ్చు.',
    ogDescription: 'బ్లాకులను పగలగొట్టండి, స్థాయిలను దాటండి, పరికరంలో పురోగతితో బ్రౌజర్‌లో ఆడండి.',
  },
  'is': {
    title: "Brikaya — kubbabrjótsleikur",
    description: "Settu upp eða spilaðu Brikaya ókeypis, án reiknings og án greiðslu; framvinda helst á tækinu og hægt er að spila án nettengingar eftir fyrstu heimsókn.",
    ogDescription: "Brikaya — kubbabrjótsleikur",
  },
  'ga': {
    title: "Brikaya — stuara briste bloic",
    description: "Suiteáil nó imir Brikaya saor in aisce, gan chuntas agus gan íocaíocht; fanann dul chun cinn ar an ngléas agus is féidir imirt as líne tar éis na chéad chuairte.",
    ogDescription: "Brikaya — stuara briste bloic",
  },
  'cy': {
    title: "Brikaya — arcêd torri blociau",
    description: "Gosodwch neu chwaraewch Brikaya am ddim, heb gyfrif a heb daliad; mae cynnydd yn aros ar y ddyfais a gellir chwarae all-lein ar ôl yr ymweliad cyntaf.",
    ogDescription: "Brikaya — arcêd torri blociau",
  },
  'mt': {
    title: "Brikaya — arcade li tkisser blokki",
    description: "Installa jew ilgħab Brikaya b'xejn, mingħajr kont u mingħajr ħlas; il-progress jibqa' fuq l-apparat u tista' tilgħab offline wara l-ewwel żjara.",
    ogDescription: "Brikaya — arcade li tkisser blokki",
  },
  'sq': {
    title: "Brikaya — arkadë thyerje blloqesh",
    description: "Instalo ose luaj Brikaya falas, pa llogari dhe pa pagesë; përparimi mbetet në pajisje dhe mund të luash jashtë linje pas vizitës së parë.",
    ogDescription: "Brikaya — arkadë thyerje blloqesh",
  },
  'mk': {
    title: "Brikaya — аркада за кршење блокови",
    description: "Инсталирајте или играјте Brikaya бесплатно, без сметка и без плаќање; напредокот останува на уредот и по првата посета може да се игра офлајн.",
    ogDescription: "Brikaya — аркада за кршење блокови",
  },
  'bs': {
    title: "Brikaya — arkada razbijanja blokova",
    description: "Instaliraj ili igraj Brikaya besplatno, bez računa i bez plaćanja; napredak ostaje na uređaju i nakon prve posjete možeš igrati offline.",
    ogDescription: "Brikaya — arkada razbijanja blokova",
  },
  'mn': {
    title: "Brikaya — блок эвдэх аркад",
    description: "Brikaya-г үнэгүй суулгаж эсвэл тоглоорой, бүртгэлгүй, төлбөргүй; ахиц төхөөрөмж дээр хадгалагдаж, эхний зочилсны дараа офлайн тоглож болно.",
    ogDescription: "Brikaya — блок эвдэх аркад",
  },
  'tg': {
    title: "Brikaya — аркадаи шикастани блокҳо",
    description: "Brikaya-ро ройгон насб кунед ё бозӣ кунед, бе ҳисоб ва бе пардохт; пешрафт дар дастгоҳ мемонад ва баъд аз боздиди аввал офлайн бозӣ кардан мумкин аст.",
    ogDescription: "Brikaya — аркадаи шикастани блокҳо",
  },
  'ky': {
    title: "Brikaya — блок сындыруу аркадасы",
    description: "Brikaya оюнун акысыз орнотуңуз же ойноңуз, эсепсиз жана төлөмсүз; жетишкендик түзмөктө сакталат жана биринчи киргенден кийин офлайн ойноого болот.",
    ogDescription: "Brikaya — блок сындыруу аркадасы",
  },
  'tk': {
    title: "Brikaya — blok döwýän arkaýa",
    description: "Brikaya-ny mugt gurnaň ýa-da oýnaň, hasapsyz we tölegsiz; ösüş enjamda galýar we ilkinji sapardan soň oflayn oýnap bolýar.",
    ogDescription: "Brikaya — blok döwýän arkaýa",
  },
  'be': {
    title: "Brikaya — аркада разбівання блокаў",
    description: "Усталюйце або гуляйце ў Brikaya бясплатна, без уліковага запісу і без аплаты; прагрэс застаецца на прыладзе, а пасля першага наведвання можна гуляць афлайн.",
    ogDescription: "Brikaya — аркада разбівання блокаў",
  },
  'lb': {
    title: "Brikaya — Blockbriecher-Arcade",
    description: "Installéiert oder spillt Brikaya gratis, ouni Kont an ouni Bezuelung; de Fortschrëtt bleift um Apparat an no der éischter Visitt kann een offline spillen.",
    ogDescription: "Brikaya — Blockbriecher-Arcade",
  },
  'eu': {
    title: "Brikaya — blokeak hausteko arcadea",
    description: "Instalatu edo jokatu Brikaya doan, konturik gabe eta ordainketarik gabe; aurrerapena gailuan geratzen da eta lehen bisitaren ondoren lineaz kanpo joka daiteke.",
    ogDescription: "Brikaya — blokeak hausteko arcadea",
  },
  'ca': {
    title: "Brikaya — arcade de trencar blocs",
    description: "Instal·la o juga a Brikaya gratis, sense compte i sense pagament; el progrés queda al dispositiu i després de la primera visita es pot jugar sense connexió.",
    ogDescription: "Brikaya — arcade de trencar blocs",
  },
  'gl': {
    title: "Brikaya — arcade de romper bloques",
    description: "Instala ou xoga a Brikaya gratis, sen conta e sen pagamento; o progreso queda no dispositivo e despois da primeira visita pódese xogar sen conexión.",
    ogDescription: "Brikaya — arcade de romper bloques",
  },
  'oc': {
    title: "Brikaya — arcada de trencar blòts",
    description: "Installatz o jogatz Brikaya gratuitament, sens compte e sens pagament; la progression demòra sus l'aparelh e aprèp la primièra visita se pòt jogar fòra linha.",
    ogDescription: "Brikaya — arcada de trencar blòts",
  },
  'br': {
    title: "Brikaya — arkad terriñ blokadoù",
    description: "Staliit pe c'hoariit Brikaya digoust, hep kont ha hep paeañ; an araokadur a chom war an ardivink hag e c'haller c'hoari ezlinenn goude ar weladenn gentañ.",
    ogDescription: "Brikaya — arkad terriñ blokadoù",
  },
  'mi': {
    title: "Brikaya — kēmu wāwāhi poraka",
    description: "Tāutahia, tākaro rānei i a Brikaya mō te kore utu, kāore he pūkete, kāore he utu; ka noho te ahunga ki tō pūrere, ā, ka taea te tākaro tuimotu i muri i te toronga tuatahi.",
    ogDescription: "Brikaya — kēmu wāwāhi poraka",
  },
  'sm': {
    title: "Brikaya — ta'aloga talepe poloka",
    description: "Fa'apipi'i pe ta'alo Brikaya fua, leai se teugatupe ma leai se totogi; e tumau le alualu i luma i le masini ma e mafai ona ta'alo offline pe a uma le asiasiga muamua.",
    ogDescription: "Brikaya — ta'aloga talepe poloka",
  },
  'to': {
    title: "Brikaya — vaʻinga maumau poloka",
    description: "Fokotuʻu pe vaʻinga Brikaya taʻetotongi, ʻikai ha ʻakauni pea ʻikai ha totongi; ʻoku nofo ʻa e laka ki muʻa ʻi he meʻangāue pea ʻe lava ke vaʻinga offline hili ʻa e ʻaʻahi ʻuluaki.",
    ogDescription: "Brikaya — vaʻinga maumau poloka",
  },
  'fj': {
    title: "Brikaya — qito voroka buloko",
    description: "Vakacuruma se qitotaka Brikaya walega, sega ni akaude se saumi; na toso e tiko ga ena nomu misini ka rawa ni qito offline ni oti na imatai ni veisiko.",
    ogDescription: "Brikaya — qito voroka buloko",
  },
  'mg': {
    title: "Brikaya — arcade mamaky sakana",
    description: "Ampidiro na milalaova Brikaya maimaim-poana, tsy mila kaonty ary tsy misy fandoavana; mijanona ao amin'ny fitaovana ny fandrosoana ary azo lalaovina ivelan'ny aterineto aorian'ny fitsidihana voalohany.",
    ogDescription: "Brikaya — arcade mamaky sakana",
  },
  'so': {
    title: "Brikaya — arcade jabinta baloogyada",
    description: "Ku rakib ama ciyaar Brikaya bilaash, xisaab la'aan iyo lacag la'aan; horumarku wuxuu ku harayaa qalabka, waxaana la ciyaari karaa offline ka dib booqashada koowaad.",
    ogDescription: "Brikaya — arcade jabinta baloogyada",
  },
  'yo': {
    title: "Brikaya — ere fifọ bulọọki",
    description: "Fi Brikaya sori ẹrọ tabi ṣere ni ọfẹ, laisi akọọlẹ ati laisi isanwo; ilọsiwaju wa lori ẹrọ rẹ ati pe o le ṣere lai si ayelujara lẹhin ibẹwo akọkọ.",
    ogDescription: "Brikaya — ere fifọ bulọọki",
  },
  'ig': {
    title: "Brikaya — egwuregwu igbaji blọọkụ",
    description: "Wụnye ma ọ bụ kpọọ Brikaya n'efu, enweghị akaụntụ na enweghị ịkwụ ụgwọ; ọganihu na-anọ na ngwaọrụ gị ma enwere ike igwu offline mgbe nleta mbụ gasịrị.",
    ogDescription: "Brikaya — egwuregwu igbaji blọọkụ",
  },
  'ha': {
    title: "Brikaya — wasan fasa tubali",
    description: "Shigar ko buga Brikaya kyauta, ba tare da asusu ba kuma ba tare da biya ba; ci gaba yana zama a kan na'urarka kuma ana iya bugawa ba tare da intanet ba bayan ziyarar farko.",
    ogDescription: "Brikaya — wasan fasa tubali",
  },
  'zu': {
    title: "Brikaya — i-arcade yokuphula amabhulokhi",
    description: "Faka noma udlale i-Brikaya mahhala, ngaphandle kwe-akhawunti futhi ngaphandle kwenkokhelo; inqubekela phambili ihlala kudivayisi futhi ungadlala ungaxhunyiwe ngemva kokuvakasha kokuqala.",
    ogDescription: "Brikaya — i-arcade yokuphula amabhulokhi",
  },
  'xh': {
    title: "Brikaya — i-arcade yokuqhekeza iibhloko",
    description: "Faka okanye udlale i-Brikaya simahla, ngaphandle kweakhawunti kwaye ngaphandle kwentlawulo; inkqubela ihlala kwisixhobo kwaye ungadlala ngaphandle kwe-intanethi emva kotyelelo lokuqala.",
    ogDescription: "Brikaya — i-arcade yokuqhekeza iibhloko",
  },
  'st': {
    title: "Brikaya — papali ea ho pshatla diboloko",
    description: "Kenya kapa bapala Brikaya mahala, ntle le akhaonto ebile ntle le tefo; tsoelo-pele e lula sesebedisweng mme o ka bapala ntle le inthanete kamora ketelo ya pele.",
    ogDescription: "Brikaya — papali ea ho pshatla diboloko",
  },
  'tn': {
    title: "Brikaya — motshameko wa go thuba diboloko",
    description: "Tsenya kgotsa tshameka Brikaya mahala, ntle le akhaonto le ntle le tuelo; kgatelopele e sala mo sedirisiweng mme o ka tshameka offline morago ga ketelo ya ntlha.",
    ogDescription: "Brikaya — motshameko wa go thuba diboloko",
  },
  'ts': {
    title: "Brikaya — ntlangu wo tshova tibuloko",
    description: "Nghenisa kumbe tlanga Brikaya mahala, handle ka akhawunti naswona handle ka ku hakela; nhluvuko wu sala eka xitirhisiwa naswona u nga tlanga offline endzhaku ka ku endza ko sungula.",
    ogDescription: "Brikaya — ntlangu wo tshova tibuloko",
  },
  'ss': {
    title: "Brikaya — umdlalo wekwephula emabhulokhi",
    description: "Faka noma udlale Brikaya mahhala, ngaphandle kwe-akhawunti nangaphandle kwenkokhelo; inqubekela phambili ihlala kudivayisi futhi ungadlala ngaphandle kwe-inthanethi ngemva kokuvakasha kokuqala.",
    ogDescription: "Brikaya — umdlalo wekwephula emabhulokhi",
  },
  've': {
    title: "Brikaya — mutambo wa u pwasha zwibuloko",
    description: "Longelani kana tambani Brikaya mahala, hu si na akhaunthu na hu si na mbadelo; mvelaphanda i sala kha tshishumiswa nahone ni nga tamba offline nga murahu ha u dalela lwa u thoma.",
    ogDescription: "Brikaya — mutambo wa u pwasha zwibuloko",
  },
  'nso': {
    title: "Brikaya — papadi ya go pšhatla diboloko",
    description: "Tsenya goba bapala Brikaya mahala, ntle le akhaonto le ntle le tefo; tšwelopele e dula sedirišweng gomme o ka bapala offline ka morago ga ketelo ya mathomo.",
    ogDescription: "Brikaya — papadi ya go pšhatla diboloko",
  },
  'rw': {
    title: "Brikaya — umukino wo kumena ibice",
    description: "Shyira Brikaya cyangwa uyikine ku buntu, nta konti kandi nta kwishyura; iterambere riguma ku gikoresho kandi ushobora gukina udafite interineti nyuma y'uruzinduko rwa mbere.",
    ogDescription: "Brikaya — umukino wo kumena ibice",
  },
  'rn': {
    title: "Brikaya — umukino wo kumena amabuye",
    description: "Shiramwo canke ukine Brikaya ku buntu, ata konti kandi ata kuriha; iterambere riguma ku gikoresho kandi ushobora gukina utari kuri interineti inyuma y'ugusura kwa mbere.",
    ogDescription: "Brikaya — umukino wo kumena amabuye",
  },
  'ln': {
    title: "Brikaya — lisano ya kobuka bablok",
    description: "Tyá to sambá Brikaya ofele, konto te mpe mbongo te; bokoli etikala na aparɛyi mpe okoki kosakana offline nsima ya botali ya liboso.",
    ogDescription: "Brikaya — lisano ya kobuka bablok",
  },
  'lg': {
    title: "Brikaya — omuzannyo gw'okumenya bulooka",
    description: "Teekamu oba zannya Brikaya ku bwereere, awatali akawunti era awatali kusasula; enkulaakulana esigala ku kyuma era osobola okuzannya nga toli ku yintaneeti oluvannyuma lw'okukyalira okusooka.",
    ogDescription: "Brikaya — omuzannyo gw'okumenya bulooka",
  },
  'ak': {
    title: "Brikaya — blɔk bubuw agodie",
    description: "Fa Brikaya gu wo mfiri so anaa di agoru kwa, konto biara nni ho na sika biara nni ho; nkɔsoɔ no tena wo mfiri so na wubetumi adi agoru offline wɔ nsrahwɛ a edi kan akyi.",
    ogDescription: "Brikaya — blɔk bubuw agodie",
  },
  'ee': {
    title: "Brikaya — blɔk gbã ƒe asixɔxɔ",
    description: "De Brikaya ɖe mɔ̃ dzi alo nɔ asixɔxɔ me dzodzro, akɔntabubu manɔmee eye fe manɔmee; ŋgɔyiyi nɔa wò mɔ̃ dzi eye àte ŋu adi asixɔxɔ offline le gbãtsɔtsɔ megbe.",
    ogDescription: "Brikaya — blɔk gbã ƒe asixɔxɔ",
  },
  'tw': {
    title: "Brikaya — blɔk bubuw agodie",
    description: "Fa Brikaya gu wo mfiri so anaa di agoru kwa, konto biara nni ho na sika biara nni ho; nkɔsoɔ no tena wo mfiri so na wubetumi adi agoru offline wɔ nsrahwɛ a edi kan akyi.",
    ogDescription: "Brikaya — blɔk bubuw agodie",
  },
  'sn': {
    title: "Brikaya — mutambo wekupwanya mabhuroko",
    description: "Isa kana tamba Brikaya mahara, pasina account uye pasina kubhadhara; kufambira mberi kunoramba kuri pamudziyo uye unogona kutamba offline mushure mekushanya kwekutanga.",
    ogDescription: "Brikaya — mutambo wekupwanya mabhuroko",
  },
  'ny': {
    title: "Brikaya — masewera ophwanya mabuloko",
    description: "Ikani kapena sewerani Brikaya kwaulere, popanda akaunti komanso popanda kulipira; kupita patsogolo kumakhala pa chipangizo ndipo mungasewere offline mutayendera koyamba.",
    ogDescription: "Brikaya — masewera ophwanya mabuloko",
  },
  'wo': {
    title: "Brikaya — poom bu toj blok",
    description: "Samp walla fo Brikaya ci lu amul fay, amul kont te amul fay; jëm kanam dina des ci sa jumtukaay te mën nga fo offline ginnaaw seetaan bu njëkk.",
    ogDescription: "Brikaya — poom bu toj blok",
  },
  'ff': {
    title: "Brikaya — fijirde mbusude bolok",
    description: "Aaf walla fij Brikaya e ɗuum yoɓetaake, alaa konte e alaa yoɓde; jokkondiral maa hokka e masiŋol maa tee aɗa waawi fijde offline caggal yillagol adan.",
    ogDescription: "Brikaya — fijirde mbusude bolok",
  },
  'om': {
    title: "Brikaya — tapha bilookii caccabsuu",
    description: "Brikaya bilisaan fe'i ykn taphadhu, herrega malee fi kaffaltii malee; tarkaanfiin meeshaa kee irratti hafa, daawwannaa jalqabaa booda offline taphachuu dandeessa.",
    ogDescription: "Brikaya — tapha bilookii caccabsuu",
  },
  'ti': {
    title: "Brikaya — ጸወታ ምስባር ብሎክ",
    description: "Brikaya ብናጻ ጫን ወይ ተጻወት፣ ብዘይ ሒሳብን ብዘይ ክፍሊትን፤ ምዕባለ ኣብ መሳርሒኻ ይቕመጥ እና ድሕሪ ቀዳማይ ምብጻሕ offline ክትጻወት ትኽእል።",
    ogDescription: "Brikaya — ጸወታ ምስባር ብሎክ",
  },
};
const DOWNLOADS_SEO = {
  'pt-BR': {
    title: 'Baixar Brikaya — jogo grátis no navegador',
    description: 'Instale ou jogue Brikaya gratuitamente, sem conta, sem pagamento, com progresso salvo no seu aparelho e jogo offline após o primeiro acesso.',
    ogDescription: 'Jogue Brikaya grátis no navegador, instale no aparelho e continue sem conta.',
  },
  'en': {
    title: 'Download Brikaya — free browser game',
    description: 'Install or play Brikaya for free, with no account, no payment, progress saved on your device, and offline play after the first visit.',
    ogDescription: 'Play Brikaya free in your browser, install it on your device, and keep playing without an account.',
  },
  'es-419': {
    title: 'Descargar Brikaya — juego gratis en el navegador',
    description: 'Instala o juega Brikaya gratis, sin cuenta, sin pago, con progreso guardado en tu dispositivo y juego sin conexión después del primer acceso.',
    ogDescription: 'Juega Brikaya gratis en el navegador, instálalo en tu dispositivo y continúa sin cuenta.',
  },
  'en-IN': {
    title: 'Download Brikaya — free browser game',
    description: 'Install or play Brikaya for free, with no account, no payment, progress saved on your device, and offline play after the first visit.',
    ogDescription: 'Play Brikaya free in your browser, install it on your device, and keep playing without an account.',
  },
  'hi-IN': {
    title: 'Brikaya डाउनलोड करें — मुफ़्त ब्राउज़र गेम',
    description: 'Brikaya को मुफ़्त इंस्टॉल करें या खेलें, बिना खाते, बिना भुगतान, डिवाइस पर प्रगति सेव और पहले उपयोग के बाद ऑफ़लाइन खेल।',
    ogDescription: 'ब्राउज़र में Brikaya मुफ़्त खेलें, डिवाइस पर इंस्टॉल करें और बिना खाते जारी रखें।',
  },
  'de': {
    title: 'Brikaya herunterladen — kostenloses Browser-Spiel',
    description: 'Installiere oder spiele Brikaya kostenlos, ohne Konto, ohne Zahlung, mit Fortschritt auf deinem Gerät und Offline-Spiel nach dem ersten Besuch.',
    ogDescription: 'Spiele Brikaya kostenlos im Browser, installiere es auf deinem Gerät und spiele ohne Konto weiter.',
  },
  'fr': {
    title: 'Télécharger Brikaya — jeu gratuit dans le navigateur',
    description: 'Installez ou jouez à Brikaya gratuitement, sans compte, sans paiement, avec progression enregistrée sur votre appareil et jeu hors connexion après la première visite.',
    ogDescription: 'Jouez à Brikaya gratuitement dans le navigateur, installez-le sur votre appareil et continuez sans compte.',
  },
  'it': {
    title: 'Scarica Brikaya — gioco gratis nel browser',
    description: 'Installa o gioca a Brikaya gratis, senza account, senza pagamento, con progressi salvati sul dispositivo e gioco offline dopo la prima visita.',
    ogDescription: 'Gioca a Brikaya gratis nel browser, installalo sul dispositivo e continua senza account.',
  },
  'ja': {
    title: 'Brikayaをダウンロード — 無料ブラウザゲーム',
    description: 'Brikayaを無料でインストールまたはプレイ。アカウント不要、支払い不要、進行状況は端末に保存、初回アクセス後はオフラインでも遊べます。',
    ogDescription: 'ブラウザでBrikayaを無料プレイ。端末にインストールして、アカウントなしで続けられます。',
  },
  'ko': {
    title: 'Brikaya 다운로드 — 무료 브라우저 게임',
    description: '계정 없이, 결제 없이 Brikaya를 무료로 설치하거나 플레이하세요. 진행 상황은 기기에 저장되고 첫 방문 후 오프라인으로도 플레이할 수 있습니다.',
    ogDescription: '브라우저에서 Brikaya를 무료로 플레이하고 기기에 설치한 뒤 계정 없이 계속 즐기세요.',
  },
  'id': {
    title: 'Unduh Brikaya — game browser gratis',
    description: 'Pasang atau mainkan Brikaya gratis, tanpa akun, tanpa pembayaran, dengan progres tersimpan di perangkat dan permainan offline setelah kunjungan pertama.',
    ogDescription: 'Mainkan Brikaya gratis di browser, pasang di perangkat, dan lanjutkan tanpa akun.',
  },
  'vi': {
    title: 'Tải Brikaya — trò chơi trình duyệt miễn phí',
    description: 'Cài đặt hoặc chơi Brikaya miễn phí, không cần tài khoản, không thanh toán, tiến trình lưu trên thiết bị và chơi ngoại tuyến sau lần truy cập đầu tiên.',
    ogDescription: 'Chơi Brikaya miễn phí trong trình duyệt, cài vào thiết bị và tiếp tục không cần tài khoản.',
  },
  'fil': {
    title: 'I-download ang Brikaya — libreng laro sa browser',
    description: 'I-install o laruin ang Brikaya nang libre, walang account, walang bayad, may progresong naka-save sa device at offline play pagkatapos ng unang bisita.',
    ogDescription: 'Maglaro ng Brikaya nang libre sa browser, i-install sa device, at magpatuloy nang walang account.',
  },
  'th': {
    title: 'ดาวน์โหลด Brikaya — เกมเบราว์เซอร์ฟรี',
    description: 'ติดตั้งหรือเล่น Brikaya ฟรี ไม่ต้องมีบัญชี ไม่ต้องจ่ายเงิน บันทึกความคืบหน้าในอุปกรณ์ และเล่นออฟไลน์ได้หลังเข้าใช้งานครั้งแรก',
    ogDescription: 'เล่น Brikaya ฟรีในเบราว์เซอร์ ติดตั้งในอุปกรณ์ และเล่นต่อโดยไม่ต้องมีบัญชี',
  },
  'zh-CN': {
    title: '下载 Brikaya — 免费浏览器游戏',
    description: '免费安装或游玩 Brikaya，无需账号，无需付款，进度保存在你的设备上，首次访问后可离线游玩。',
    ogDescription: '在浏览器中免费游玩 Brikaya，安装到设备，并且无需账号即可继续。',
  },


  'ar': {
    title: 'تنزيل Brikaya — لعبة متصفح مجانية',
    description: 'ثبّت Brikaya أو العبها مجانًا، بدون حساب، بدون دفع، مع حفظ التقدم على جهازك واللعب دون اتصال بعد أول زيارة.',
    ogDescription: 'العب Brikaya مجانًا في المتصفح، وثبّتها على جهازك، وتابع بدون حساب.',
  },
  'ru': {
    title: 'Скачать Brikaya — бесплатная браузерная игра',
    description: 'Установите или играйте в Brikaya бесплатно, без аккаунта, без оплаты, с прогрессом на устройстве и офлайн-игрой после первого визита.',
    ogDescription: 'Играйте в Brikaya бесплатно в браузере, установите на устройство и продолжайте без аккаунта.',
  },
  'tr': {
    title: 'Brikaya\'yı indir — ücretsiz tarayıcı oyunu',
    description: 'Brikaya\'yı ücretsiz kurun veya oynayın; hesap yok, ödeme yok, ilerleme cihazınızda kalır ve ilk ziyaretten sonra çevrimdışı oynanır.',
    ogDescription: 'Brikaya\'yı tarayıcıda ücretsiz oynayın, cihazınıza kurun ve hesap olmadan devam edin.',
  },
  'nl': {
    title: 'Brikaya downloaden — gratis browserspel',
    description: 'Installeer of speel Brikaya gratis, geen account, geen betaling, met voortgang op je apparaat en offline spelen na het eerste bezoek.',
    ogDescription: 'Speel Brikaya gratis in de browser, installeer op je apparaat en speel verder zonder account.',
  },
  'pl': {
    title: 'Pobierz Brikaya — darmowa gra przeglądarkowa',
    description: 'Zainstaluj lub graj w Brikaya za darmo, bez konta, bez płatności, z postępem na urządzeniu i grą offline po pierwszej wizycie.',
    ogDescription: 'Graj w Brikaya za darmo w przeglądarce, zainstaluj na urządzeniu i graj dalej bez konta.',
  },
  'uk': {
    title: 'Завантажити Brikaya — безкоштовна браузерна гра',
    description: 'Установіть або грайте в Brikaya безкоштовно, без облікового запису, без оплати, з прогресом на пристрої та офлайн-грою після першого відвідування.',
    ogDescription: 'Грайте в Brikaya безкоштовно в браузері, установіть на пристрій і продовжуйте без облікового запису.',
  },
  'ms': {
    title: 'Muat turun Brikaya — permainan pelayar percuma',
    description: 'Pasang atau main Brikaya secara percuma, tanpa akaun, tanpa bayaran, dengan kemajuan pada peranti dan permainan luar talian selepas lawatan pertama.',
    ogDescription: 'Main Brikaya percuma dalam pelayar, pasang pada peranti dan teruskan tanpa akaun.',
  },
  'zh-TW': {
    title: '下載 Brikaya — 免費瀏覽器遊戲',
    description: '免費安裝或遊玩 Brikaya，無需帳號，無需付款，進度保存在你的裝置上，首次造訪後可離線遊玩。',
    ogDescription: '在瀏覽器中免費遊玩 Brikaya，安裝到裝置，並且無需帳號即可繼續。',
  },
  'pt-PT': {
    title: 'Descarregar Brikaya — jogo grátis no navegador',
    description: 'Instale ou jogue Brikaya gratuitamente, sem conta, sem pagamento, com progresso guardado no seu aparelho e jogo offline após o primeiro acesso.',
    ogDescription: 'Jogue Brikaya grátis no navegador, instale no aparelho e continue sem conta.',
  },
  'es-ES': {
    title: 'Descargar Brikaya — juego gratis en el navegador',
    description: 'Instala o juega Brikaya gratis, sin cuenta, sin pago, con progreso guardado en tu dispositivo y juego sin conexión después del primer acceso.',
    ogDescription: 'Juega Brikaya gratis en el navegador, instálalo en tu dispositivo y continúa sin cuenta.',
  },
  'en-GB': {
    title: 'Download Brikaya — free browser game',
    description: 'Install or play Brikaya for free, with no account, no payment, progress saved on your device, and offline play after the first visit.',
    ogDescription: 'Play Brikaya free in your browser, install it on your device, and keep playing without an account.',
  },
  'fr-CA': {
    title: 'Télécharger Brikaya — jeu gratuit dans le navigateur',
    description: 'Installez ou jouez à Brikaya gratuitement, sans compte, sans paiement, avec progression enregistrée sur votre appareil et jeu hors connexion après la première visite.',
    ogDescription: 'Jouez à Brikaya gratuitement dans le navigateur, installez-le sur votre appareil et continuez sans compte.',
  },
  'bn': {
    title: 'Brikaya ডাউনলোড করুন — বিনামূল্যের ব্রাউজার গেম',
    description: 'অ্যাকাউন্ট ছাড়া, পেমেন্ট ছাড়া Brikaya বিনামূল্যে ইনস্টল করুন বা খেলুন; অগ্রগতি ডিভাইসে থাকে এবং প্রথম ভিজিটের পরে অফলাইনে খেলা যায়।',
    ogDescription: 'ব্রাউজারে Brikaya বিনামূল্যে খেলুন, ডিভাইসে ইনস্টল করুন এবং অ্যাকাউন্ট ছাড়া চালিয়ে যান।',
  },
  'ur': {
    title: 'Brikaya ڈاؤن لوڈ کریں — مفت براؤزر گیم',
    description: 'Brikaya مفت انسٹال کریں یا کھیلیں، اکاؤنٹ کے بغیر، ادائیگی کے بغیر، آلے پر محفوظ پیش رفت اور پہلی بار کے بعد آف لائن کھیل کے ساتھ۔',
    ogDescription: 'براؤزر میں Brikaya مفت کھیلیں، آلے پر انسٹال کریں اور اکاؤنٹ کے بغیر جاری رکھیں۔',
  },
  'fa': {
    title: 'دانلود Brikaya — بازی رایگان مرورگر',
    description: 'Brikaya را رایگان نصب کنید یا بازی کنید، بدون حساب، بدون پرداخت، با پیشرفت ذخیره‌شده روی دستگاه و بازی آفلاین پس از اولین بازدید.',
    ogDescription: 'Brikaya را رایگان در مرورگر بازی کنید، روی دستگاه نصب کنید و بدون حساب ادامه دهید.',
  },
  'he': {
    title: 'הורדת Brikaya — משחק דפדפן חינם',
    description: 'התקינו או שחקו ב־Brikaya בחינם, בלי חשבון, בלי תשלום, עם התקדמות שנשמרת במכשיר ומשחק בלי חיבור אחרי הביקור הראשון.',
    ogDescription: 'שחקו ב־Brikaya בחינם בדפדפן, התקינו במכשיר והמשיכו בלי חשבון.',
  },
  'ta': {
    title: 'Brikaya பதிவிறக்கவும் — இலவச உலாவி விளையாட்டு',
    description: 'கணக்கு இல்லாமல், கட்டணம் இல்லாமல் Brikaya-வை இலவசமாக நிறுவவும் அல்லது விளையாடவும்; முன்னேற்றம் சாதனத்தில் சேமிக்கப்படும், முதல் வருகைக்குப் பிறகு ஆஃப்லைனில் விளையாடலாம்.',
    ogDescription: 'Brikaya-வை உலாவியில் இலவசமாக விளையாடுங்கள், சாதனத்தில் நிறுவி கணக்கு இல்லாமல் தொடருங்கள்.',
  },
  'mr': {
    title: "Brikaya डाउनलोड करा — मोफत ब्राउझर गेम",
    description: "खाते नसताना, पैसे न देता Brikaya मोफत इन्स्टॉल करा किंवा खेळा; प्रगती डिव्हाइसवर राहते आणि पहिल्या भेटीनंतर ऑफलाइन खेळता येते.",
    ogDescription: "खाते नसताना, पैसे न देता Brikaya मोफत इन्स्टॉल करा किंवा खेळा; प्रगती डिव्हाइसवर राहते आणि पहिल्या भेटीनंतर ऑफलाइन खेळता येते.",
  },
  'gu': {
    title: "Brikaya ડાઉનલોડ કરો — મફત બ્રાઉઝર ગેમ",
    description: "ખાતા વગર, ચુકવણી વગર Brikaya મફતમાં ઇન્સ્ટોલ કરો અથવા રમો; પ્રગતિ ઉપકરણમાં રહે છે અને પ્રથમ મુલાકાત પછી ઑફલાઇન રમાય છે.",
    ogDescription: "ખાતા વગર, ચુકવણી વગર Brikaya મફતમાં ઇન્સ્ટોલ કરો અથવા રમો; પ્રગતિ ઉપકરણમાં રહે છે અને પ્રથમ મુલાકાત પછી ઑફલાઇન રમાય છે.",
  },
  'kn': {
    title: "Brikaya ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ — ಉಚಿತ ಬ್ರೌಸರ್ ಆಟ",
    description: "ಖಾತೆ ಇಲ್ಲದೆ, ಪಾವತಿ ಇಲ್ಲದೆ Brikaya ಅನ್ನು ಉಚಿತವಾಗಿ ಸ್ಥಾಪಿಸಿ ಅಥವಾ ಆಡಿ; ಪ್ರಗತಿ ಸಾಧನದಲ್ಲೇ ಉಳಿಯುತ್ತದೆ ಮತ್ತು ಮೊದಲ ಭೇಟಿ ನಂತರ ಆಫ್‌ಲೈನ್ ಆಟ ಲಭ್ಯ.",
    ogDescription: "ಖಾತೆ ಇಲ್ಲದೆ, ಪಾವತಿ ಇಲ್ಲದೆ Brikaya ಅನ್ನು ಉಚಿತವಾಗಿ ಸ್ಥಾಪಿಸಿ ಅಥವಾ ಆಡಿ; ಪ್ರಗತಿ ಸಾಧನದಲ್ಲೇ ಉಳಿಯುತ್ತದೆ ಮತ್ತು ಮೊದಲ ಭೇಟಿ ನಂತರ ಆಫ್‌ಲೈನ್ ಆಟ ಲಭ್ಯ.",
  },
  'ml': {
    title: "Brikaya ഡൗൺലോഡ് ചെയ്യുക — സൗജന്യ ബ്രൗസർ ഗെയിം",
    description: "അക്കൗണ്ട് ഇല്ലാതെ, പണം ഇല്ലാതെ Brikaya സൗജന്യമായി ഇൻസ്റ്റാൾ ചെയ്യുകയോ കളിക്കുകയോ ചെയ്യാം; പുരോഗതി ഉപകരണത്തിൽ തന്നെ നിലനിൽക്കും, ആദ്യ സന്ദർശനത്തിന് ശേഷം ഓഫ്‌ലൈൻ കളിക്കാം.",
    ogDescription: "അക്കൗണ്ട് ഇല്ലാതെ, പണം ഇല്ലാതെ Brikaya സൗജന്യമായി ഇൻസ്റ്റാൾ ചെയ്യുകയോ കളിക്കുകയോ ചെയ്യാം; പുരോഗതി ഉപകരണത്തിൽ തന്നെ നിലനിൽക്കും, ആദ്യ സന്ദർശനത്തിന് ശേഷം ഓഫ്‌ലൈൻ കളിക്കാം.",
  },
  'pa': {
    title: "Brikaya ਡਾਊਨਲੋਡ ਕਰੋ — ਮੁਫ਼ਤ ਬ੍ਰਾਊਜ਼ਰ ਗੇਮ",
    description: "ਖਾਤੇ ਤੋਂ ਬਿਨਾਂ, ਭੁਗਤਾਨ ਤੋਂ ਬਿਨਾਂ Brikaya ਮੁਫ਼ਤ ਇੰਸਟਾਲ ਕਰੋ ਜਾਂ ਖੇਡੋ; ਤਰੱਕੀ ਡਿਵਾਈਸ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ ਅਤੇ ਪਹਿਲੀ ਵਾਰ ਤੋਂ ਬਾਅਦ ਆਫਲਾਈਨ ਖੇਡ ਸਕਦੇ ਹੋ।",
    ogDescription: "ਖਾਤੇ ਤੋਂ ਬਿਨਾਂ, ਭੁਗਤਾਨ ਤੋਂ ਬਿਨਾਂ Brikaya ਮੁਫ਼ਤ ਇੰਸਟਾਲ ਕਰੋ ਜਾਂ ਖੇਡੋ; ਤਰੱਕੀ ਡਿਵਾਈਸ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ ਅਤੇ ਪਹਿਲੀ ਵਾਰ ਤੋਂ ਬਾਅਦ ਆਫਲਾਈਨ ਖੇਡ ਸਕਦੇ ਹੋ।",
  },
  'el': {
    title: "Λήψη Brikaya — δωρεάν παιχνίδι browser",
    description: "Εγκαταστήστε ή παίξτε Brikaya δωρεάν, χωρίς λογαριασμό, χωρίς πληρωμή, με πρόοδο στη συσκευή και παιχνίδι εκτός σύνδεσης μετά την πρώτη επίσκεψη.",
    ogDescription: "Εγκαταστήστε ή παίξτε Brikaya δωρεάν, χωρίς λογαριασμό, χωρίς πληρωμή, με πρόοδο στη συσκευή και παιχνίδι εκτός σύνδεσης μετά την πρώτη επίσκεψη.",
  },
  'sv': {
    title: "Ladda ner Brikaya — gratis webbläsarspel",
    description: "Installera eller spela Brikaya gratis, utan konto, utan betalning, med framsteg sparade på enheten och offlinespel efter första besöket.",
    ogDescription: "Installera eller spela Brikaya gratis, utan konto, utan betalning, med framsteg sparade på enheten och offlinespel efter första besöket.",
  },
  'da': {
    title: "Download Brikaya — gratis browserspil",
    description: "Installer eller spil Brikaya gratis, uden konto, uden betaling, med fremskridt gemt på enheden og offline spil efter første besøg.",
    ogDescription: "Installer eller spil Brikaya gratis, uden konto, uden betaling, med fremskridt gemt på enheden og offline spil efter første besøg.",
  },
  'no': {
    title: "Last ned Brikaya — gratis nettleserspill",
    description: "Installer eller spill Brikaya gratis, uten konto, uten betaling, med fremdrift lagret på enheten og offline spill etter første besøk.",
    ogDescription: "Installer eller spill Brikaya gratis, uten konto, uten betaling, med fremdrift lagret på enheten og offline spill etter første besøk.",
  },
  'fi': {
    title: "Lataa Brikaya — ilmainen selainpeli",
    description: "Asenna tai pelaa Brikayaa ilmaiseksi, ilman tiliä, ilman maksua, edistyminen tallennettuna laitteelle ja offline-peli ensimmäisen käynnin jälkeen.",
    ogDescription: "Asenna tai pelaa Brikayaa ilmaiseksi, ilman tiliä, ilman maksua, edistyminen tallennettuna laitteelle ja offline-peli ensimmäisen käynnin jälkeen.",
  },
  'cs': {
    title: "Stáhnout Brikaya — bezplatná hra v prohlížeči",
    description: "Nainstalujte nebo hrajte Brikaya zdarma, bez účtu a bez platby; postup zůstává v zařízení a po první návštěvě lze hrát offline. bez účtu.",
    ogDescription: "Stáhnout Brikaya — bez účtu",
  },
  'ro': {
    title: "Descarcă Brikaya — joc gratuit în browser",
    description: "Instalează sau joacă Brikaya gratuit, fără cont și fără plată; progresul rămâne pe dispozitiv și poți juca offline după prima vizită. fără cont.",
    ogDescription: "Descarcă Brikaya — fără cont",
  },
  'hu': {
    title: "Brikaya letöltése — ingyenes böngészős játék",
    description: "Telepítsd vagy játszd a Brikaya játékot ingyen, fiók és fizetés nélkül; a haladás az eszközön marad, és az első látogatás után offline is játszható. fiók nélkül.",
    ogDescription: "Brikaya letöltése — fiók nélkül",
  },
  'bg': {
    title: "Изтеглете Brikaya — безплатна игра в браузъра",
    description: "Инсталирайте или играйте Brikaya безплатно, без акаунт и без плащане; напредъкът остава на устройството и след първото посещение играта работи офлайн. без акаунт.",
    ogDescription: "Изтеглете Brikaya — без акаунт",
  },
  'sk': {
    title: "Stiahnuť Brikaya — bezplatná hra v prehliadači",
    description: "Nainštalujte alebo hrajte Brikaya zadarmo, bez účtu a bez platby; postup zostáva v zariadení a po prvej návšteve možno hrať offline. bez účtu.",
    ogDescription: "Stiahnuť Brikaya — bez účtu",
  },
  'sl': {
    title: "Prenesi Brikaya — brezplačna igra v brskalniku",
    description: "Namestite ali igrajte Brikaya brezplačno, brez računa in brez plačila; napredek ostane v napravi, po prvem obisku pa je igra na voljo brez povezave. brez računa.",
    ogDescription: "Prenesi Brikaya — brez računa",
  },
  'hr': {
    title: "Preuzmi Brikaya — besplatna igra u pregledniku",
    description: "Instaliraj ili igraj Brikaya besplatno, bez računa i bez plaćanja; napredak ostaje na uređaju, a nakon prvog posjeta možeš igrati offline. bez računa.",
    ogDescription: "Preuzmi Brikaya — bez računa",
  },
  'sr': {
    title: "Преузми Brikaya — бесплатна игра у прегледачу",
    description: "Инсталирајте или играјте Brikaya бесплатно, без налога и без плаћања; напредак остаје на уређају и после прве посете можете играти офлајн. без налога.",
    ogDescription: "Преузми Brikaya — без налога",
  },
  'lt': {
    title: "Atsisiųsti Brikaya — nemokamas naršyklės žaidimas",
    description: "Įdiekite arba žaiskite Brikaya nemokamai, be paskyros ir be mokėjimo; pažanga lieka įrenginyje, o po pirmo apsilankymo galima žaisti neprisijungus. be paskyros.",
    ogDescription: "Atsisiųsti Brikaya — be paskyros",
  },
  'lv': {
    title: "Lejupielādēt Brikaya — bezmaksas pārlūka spēle",
    description: "Instalējiet vai spēlējiet Brikaya bez maksas, bez konta un bez maksājuma; progress paliek ierīcē, un pēc pirmā apmeklējuma var spēlēt bezsaistē. bez konta.",
    ogDescription: "Lejupielādēt Brikaya — bez konta",
  },
  'et': {
    title: "Laadi alla Brikaya — tasuta brauserimäng",
    description: "Paigalda või mängi Brikayat tasuta, ilma kontota ja makseta; edenemine jääb seadmesse ning pärast esimest külastust saab mängida võrguühenduseta. ilma kontota.",
    ogDescription: "Laadi alla Brikaya — ilma kontota",
  },
  'sw': {
    title: "Pakua Brikaya — mchezo wa bure wa kivinjari",
    description: "Sakinisha au cheza Brikaya bila malipo, bila akaunti na bila malipo yoyote; maendeleo hubaki kwenye kifaa na unaweza kucheza nje ya mtandao baada ya ziara ya kwanza. bila akaunti.",
    ogDescription: "Pakua Brikaya — bila akaunti",
  },
  'af': {
    title: "Laai Brikaya af — gratis blaaier-speletjie",
    description: "Installeer of speel Brikaya gratis, sonder rekening en sonder betaling; vordering bly op die toestel en ná die eerste besoek kan jy vanlyn speel. sonder rekening.",
    ogDescription: "Laai Brikaya af — sonder rekening",
  },
  'am': {
    title: "Brikaya አውርድ — ነፃ የአሳሽ ጨዋታ",
    description: "Brikayaን በነፃ ይጫኑ ወይም ይጫወቱ፣ ያለ መለያ እና ያለ ክፍያ፤ ሂደት በመሣሪያው ላይ ይቀመጣል እና ከመጀመሪያ ጉብኝት በኋላ ከመስመር ውጭ መጫወት ይቻላል። ያለ መለያ.",
    ogDescription: "Brikaya አውርድ — ያለ መለያ",
  },
  'ka': {
    title: "ჩამოტვირთეთ Brikaya — უფასო ბრაუზერის თამაში",
    description: "დააყენეთ ან ითამაშეთ Brikaya უფასოდ, ანგარიშისა და გადახდის გარეშე; პროგრესი რჩება მოწყობილობაზე და პირველი ვიზიტის შემდეგ თამაში შესაძლებელია ოფლაინ. ანგარიშის გარეშე.",
    ogDescription: "ჩამოტვირთეთ Brikaya — ანგარიშის გარეშე",
  },
  'hy': {
    title: "Ներբեռնել Brikaya — անվճար բրաուզերային խաղ",
    description: "Տեղադրեք կամ խաղացեք Brikaya անվճար, առանց հաշվի և առանց վճարման․ առաջընթացը մնում է սարքում, իսկ առաջին այցելությունից հետո հնարավոր է խաղալ անցանց։ առանց հաշվի.",
    ogDescription: "Ներբեռնել Brikaya — առանց հաշվի",
  },
  'az': {
    title: "Brikaya endirin — pulsuz brauzer oyunu",
    description: "Brikaya-nı pulsuz quraşdırın və ya oynayın, hesab və ödəniş olmadan; irəliləyiş cihazda qalır və ilk ziyarətdən sonra oflayn oynamaq mümkündür. hesabsız.",
    ogDescription: "Brikaya endirin — hesabsız",
  },
  'kk': {
    title: "Brikaya жүктеп алу — тегін браузер ойыны",
    description: "Brikaya ойынын тегін орнатыңыз немесе ойнаңыз, есептік жазбасыз және төлемсіз; прогресс құрылғыда қалады және бірінші кіргеннен кейін офлайн ойнауға болады. есептік жазбасыз.",
    ogDescription: "Brikaya жүктеп алу — есептік жазбасыз",
  },
  'uz': {
    title: "Brikaya yuklab olish — bepul brauzer o‘yini",
    description: "Brikaya-ni bepul o‘rnating yoki o‘ynang, hisob va to‘lovsiz; jarayon qurilmada qoladi va birinchi tashrifdan keyin oflayn o‘ynash mumkin. hisobsiz.",
    ogDescription: "Brikaya yuklab olish — hisobsiz",
  },
  'ne': {
    title: "Brikaya डाउनलोड गर्नुहोस् — निःशुल्क ब्राउजर खेल",
    description: "Brikaya निःशुल्क स्थापना गर्नुहोस् वा खेल्नुहोस्, खाता बिना र भुक्तानी बिना; प्रगति उपकरणमै रहन्छ र पहिलो भ्रमणपछि अफलाइन खेल्न सकिन्छ। खाता बिना.",
    ogDescription: "Brikaya डाउनलोड गर्नुहोस् — खाता बिना",
  },
  'si': {
    title: "Brikaya බාගන්න — නොමිලේ බ්‍රවුසර ක්‍රීඩාව",
    description: "Brikaya නොමිලේ ස්ථාපනය කරන්න හෝ ක්‍රීඩා කරන්න, ගිණුමක් නැතිව සහ ගෙවීමකින් තොරව; ප්‍රගතිය උපාංගයේම රැඳේ සහ පළමු පිවිසුමෙන් පසු නොබැඳිව ක්‍රීඩා කළ හැක. ගිණුමක් නැතිව.",
    ogDescription: "Brikaya බාගන්න — ගිණුමක් නැතිව",
  },
  'km': {
    title: "ទាញយក Brikaya — ហ្គេមកម្មវិធីរុករកឥតគិតថ្លៃ",
    description: "ដំឡើង ឬលេង Brikaya ដោយឥតគិតថ្លៃ គ្មានគណនី និងគ្មានការបង់ប្រាក់; វឌ្ឍនភាពនៅលើឧបករណ៍ ហើយអាចលេងក្រៅបណ្ដាញបន្ទាប់ពីចូលមើលដំបូង។ គ្មានគណនី.",
    ogDescription: "ទាញយក Brikaya — គ្មានគណនី",
  },
  'lo': {
    title: "ດາວໂຫຼດ Brikaya — ເກມບຣາວເຊີຟຣີ",
    description: "ຕິດຕັ້ງ ຫຼື ຫຼິ້ນ Brikaya ຟຣີ, ບໍ່ຕ້ອງມີບັນຊີ ແລະ ບໍ່ມີການຈ່າຍເງິນ; ຄວາມຄືບໜ້າຢູ່ໃນອຸປະກອນ ແລະ ຫຼິ້ນອອຟລາຍໄດ້ຫຼັງການເຂົ້າຄັ້ງທໍາອິດ. ບໍ່ຕ້ອງມີບັນຊີ.",
    ogDescription: "ດາວໂຫຼດ Brikaya — ບໍ່ຕ້ອງມີບັນຊີ",
  },
  'my': {
    title: "Brikaya ဒေါင်းလုဒ်လုပ်ရန် — အခမဲ့ ဘရောက်ဇာဂိမ်း",
    description: "Brikaya ကို အခမဲ့ တပ်ဆင်ပါ သို့မဟုတ် ကစားပါ၊ အကောင့်မလို၊ ငွေပေးချေမှုမလို; တိုးတက်မှုသည် စက်ပေါ်တွင် ಉಳಿದು ပထမဆုံးဝင်ရောက်ပြီးနောက် အော့ဖ်လိုင်းကစားနိုင်သည်။ အကောင့်မလို.",
    ogDescription: "Brikaya ဒေါင်းလုဒ်လုပ်ရန် — အကောင့်မလို",
  },
  'te': {
    title: 'Brikaya డౌన్‌లోడ్ చేయండి — ఉచిత బ్రౌజర్ గేమ్',
    description: 'ఖాతా లేకుండా, చెల్లింపు లేకుండా Brikayaని ఉచితంగా ఇన్‌స్టాల్ చేయండి లేదా ఆడండి; పురోగతి పరికరంలో ఉంటుంది మరియు మొదటి సందర్శన తర్వాత ఆఫ్‌లైన్‌లో ఆడవచ్చు.',
    ogDescription: 'Brikayaని బ్రౌజర్‌లో ఉచితంగా ఆడండి, పరికరంలో ఇన్‌స్టాల్ చేసి ఖాతా లేకుండా కొనసాగండి.',
  },
  'is': {
    title: "Sækja Brikaya — ókeypis vafraleikur",
    description: "Settu upp eða spilaðu Brikaya ókeypis, án reiknings og án greiðslu; framvinda helst á tækinu og hægt er að spila án nettengingar eftir fyrstu heimsókn. án reiknings.",
    ogDescription: "Sækja Brikaya — án reiknings",
  },
  'ga': {
    title: "Íoslódáil Brikaya — cluiche brabhsálaí saor in aisce",
    description: "Suiteáil nó imir Brikaya saor in aisce, gan chuntas agus gan íocaíocht; fanann dul chun cinn ar an ngléas agus is féidir imirt as líne tar éis na chéad chuairte. gan chuntas.",
    ogDescription: "Íoslódáil Brikaya — gan chuntas",
  },
  'cy': {
    title: "Lawrlwytho Brikaya — gêm porwr am ddim",
    description: "Gosodwch neu chwaraewch Brikaya am ddim, heb gyfrif a heb daliad; mae cynnydd yn aros ar y ddyfais a gellir chwarae all-lein ar ôl yr ymweliad cyntaf. heb gyfrif.",
    ogDescription: "Lawrlwytho Brikaya — heb gyfrif",
  },
  'mt': {
    title: "Niżżel Brikaya — logħba tal-browser b'xejn",
    description: "Installa jew ilgħab Brikaya b'xejn, mingħajr kont u mingħajr ħlas; il-progress jibqa' fuq l-apparat u tista' tilgħab offline wara l-ewwel żjara. mingħajr kont.",
    ogDescription: "Niżżel Brikaya — mingħajr kont",
  },
  'sq': {
    title: "Shkarko Brikaya — lojë falas në shfletues",
    description: "Instalo ose luaj Brikaya falas, pa llogari dhe pa pagesë; përparimi mbetet në pajisje dhe mund të luash jashtë linje pas vizitës së parë. pa llogari.",
    ogDescription: "Shkarko Brikaya — pa llogari",
  },
  'mk': {
    title: "Преземи Brikaya — бесплатна игра во прелистувач",
    description: "Инсталирајте или играјте Brikaya бесплатно, без сметка и без плаќање; напредокот останува на уредот и по првата посета може да се игра офлајн. без сметка.",
    ogDescription: "Преземи Brikaya — без сметка",
  },
  'bs': {
    title: "Preuzmi Brikaya — besplatna igra u pregledniku",
    description: "Instaliraj ili igraj Brikaya besplatno, bez računa i bez plaćanja; napredak ostaje na uređaju i nakon prve posjete možeš igrati offline. bez računa.",
    ogDescription: "Preuzmi Brikaya — bez računa",
  },
  'mn': {
    title: "Brikaya татаж авах — үнэгүй хөтөчийн тоглоом",
    description: "Brikaya-г үнэгүй суулгаж эсвэл тоглоорой, бүртгэлгүй, төлбөргүй; ахиц төхөөрөмж дээр хадгалагдаж, эхний зочилсны дараа офлайн тоглож болно. бүртгэлгүй.",
    ogDescription: "Brikaya татаж авах — бүртгэлгүй",
  },
  'tg': {
    title: "Боргирии Brikaya — бозии ройгони браузер",
    description: "Brikaya-ро ройгон насб кунед ё бозӣ кунед, бе ҳисоб ва бе пардохт; пешрафт дар дастгоҳ мемонад ва баъд аз боздиди аввал офлайн бозӣ кардан мумкин аст. бе ҳисоб.",
    ogDescription: "Боргирии Brikaya — бе ҳисоб",
  },
  'ky': {
    title: "Brikaya жүктөп алуу — акысыз браузер оюну",
    description: "Brikaya оюнун акысыз орнотуңуз же ойноңуз, эсепсиз жана төлөмсүз; жетишкендик түзмөктө сакталат жана биринчи киргенден кийин офлайн ойноого болот. эсепсиз.",
    ogDescription: "Brikaya жүктөп алуу — эсепсиз",
  },
  'tk': {
    title: "Brikaya ýükläp al — mugt brauzer oýny",
    description: "Brikaya-ny mugt gurnaň ýa-da oýnaň, hasapsyz we tölegsiz; ösüş enjamda galýar we ilkinji sapardan soň oflayn oýnap bolýar. hasapsyz.",
    ogDescription: "Brikaya ýükläp al — hasapsyz",
  },
  'be': {
    title: "Спампаваць Brikaya — бясплатная браузерная гульня",
    description: "Усталюйце або гуляйце ў Brikaya бясплатна, без уліковага запісу і без аплаты; прагрэс застаецца на прыладзе, а пасля першага наведвання можна гуляць афлайн. без уліковага запісу.",
    ogDescription: "Спампаваць Brikaya — без уліковага запісу",
  },
  'lb': {
    title: "Brikaya eroflueden — gratis Browser-Spill",
    description: "Installéiert oder spillt Brikaya gratis, ouni Kont an ouni Bezuelung; de Fortschrëtt bleift um Apparat an no der éischter Visitt kann een offline spillen. ouni Kont.",
    ogDescription: "Brikaya eroflueden — ouni Kont",
  },
  'eu': {
    title: "Deskargatu Brikaya — doako nabigatzaile-jokoa",
    description: "Instalatu edo jokatu Brikaya doan, konturik gabe eta ordainketarik gabe; aurrerapena gailuan geratzen da eta lehen bisitaren ondoren lineaz kanpo joka daiteke. konturik gabe.",
    ogDescription: "Deskargatu Brikaya — konturik gabe",
  },
  'ca': {
    title: "Baixa Brikaya — joc gratuït de navegador",
    description: "Instal·la o juga a Brikaya gratis, sense compte i sense pagament; el progrés queda al dispositiu i després de la primera visita es pot jugar sense connexió. sense compte.",
    ogDescription: "Baixa Brikaya — sense compte",
  },
  'gl': {
    title: "Descargar Brikaya — xogo gratuíto no navegador",
    description: "Instala ou xoga a Brikaya gratis, sen conta e sen pagamento; o progreso queda no dispositivo e despois da primeira visita pódese xogar sen conexión. sen conta.",
    ogDescription: "Descargar Brikaya — sen conta",
  },
  'oc': {
    title: "Telecargar Brikaya — jòc de navigador gratuit",
    description: "Installatz o jogatz Brikaya gratuitament, sens compte e sens pagament; la progression demòra sus l'aparelh e aprèp la primièra visita se pòt jogar fòra linha. sens compte.",
    ogDescription: "Telecargar Brikaya — sens compte",
  },
  'br': {
    title: "Pellgargañ Brikaya — c'hoari merdeer digoust",
    description: "Staliit pe c'hoariit Brikaya digoust, hep kont ha hep paeañ; an araokadur a chom war an ardivink hag e c'haller c'hoari ezlinenn goude ar weladenn gentañ. hep kont.",
    ogDescription: "Pellgargañ Brikaya — hep kont",
  },
  'mi': {
    title: "Tikiake Brikaya — kēmu pūtirotiro kore utu",
    description: "Tāutahia, tākaro rānei i a Brikaya mō te kore utu, kāore he pūkete, kāore he utu; ka noho te ahunga ki tō pūrere, ā, ka taea te tākaro tuimotu i muri i te toronga tuatahi. kāore he pūkete.",
    ogDescription: "Tikiake Brikaya — kāore he pūkete",
  },
  'sm': {
    title: "La'u mai Brikaya — ta'aloga su'esu'e fua",
    description: "Fa'apipi'i pe ta'alo Brikaya fua, leai se teugatupe ma leai se totogi; e tumau le alualu i luma i le masini ma e mafai ona ta'alo offline pe a uma le asiasiga muamua. leai se teugatupe.",
    ogDescription: "La'u mai Brikaya — leai se teugatupe",
  },
  'to': {
    title: "Hiki mai Brikaya — vaʻinga browser taʻetotongi",
    description: "Fokotuʻu pe vaʻinga Brikaya taʻetotongi, ʻikai ha ʻakauni pea ʻikai ha totongi; ʻoku nofo ʻa e laka ki muʻa ʻi he meʻangāue pea ʻe lava ke vaʻinga offline hili ʻa e ʻaʻahi ʻuluaki. ʻikai ha ʻakauni.",
    ogDescription: "Hiki mai Brikaya — ʻikai ha ʻakauni",
  },
  'fj': {
    title: "Lavetaka Brikaya — qito browser sega ni saumi",
    description: "Vakacuruma se qitotaka Brikaya walega, sega ni akaude se saumi; na toso e tiko ga ena nomu misini ka rawa ni qito offline ni oti na imatai ni veisiko. sega ni akaude.",
    ogDescription: "Lavetaka Brikaya — sega ni akaude",
  },
  'mg': {
    title: "Ampidino Brikaya — lalao navigateur maimaim-poana",
    description: "Ampidiro na milalaova Brikaya maimaim-poana, tsy mila kaonty ary tsy misy fandoavana; mijanona ao amin'ny fitaovana ny fandrosoana ary azo lalaovina ivelan'ny aterineto aorian'ny fitsidihana voalohany. tsy mila kaonty.",
    ogDescription: "Ampidino Brikaya — tsy mila kaonty",
  },
  'so': {
    title: "Soo dejiso Brikaya — ciyaar biraawsar bilaash ah",
    description: "Ku rakib ama ciyaar Brikaya bilaash, xisaab la'aan iyo lacag la'aan; horumarku wuxuu ku harayaa qalabka, waxaana la ciyaari karaa offline ka dib booqashada koowaad. xisaab la'aan.",
    ogDescription: "Soo dejiso Brikaya — xisaab la'aan",
  },
  'yo': {
    title: "Gba Brikaya silẹ — ere aṣàwákiri ọfẹ",
    description: "Fi Brikaya sori ẹrọ tabi ṣere ni ọfẹ, laisi akọọlẹ ati laisi isanwo; ilọsiwaju wa lori ẹrọ rẹ ati pe o le ṣere lai si ayelujara lẹhin ibẹwo akọkọ. laisi akọọlẹ.",
    ogDescription: "Gba Brikaya silẹ — laisi akọọlẹ",
  },
  'ig': {
    title: "Budata Brikaya — egwuregwu nchọgharị efu",
    description: "Wụnye ma ọ bụ kpọọ Brikaya n'efu, enweghị akaụntụ na enweghị ịkwụ ụgwọ; ọganihu na-anọ na ngwaọrụ gị ma enwere ike igwu offline mgbe nleta mbụ gasịrị. enweghị akaụntụ.",
    ogDescription: "Budata Brikaya — enweghị akaụntụ",
  },
  'ha': {
    title: "Zazzage Brikaya — wasan burauza kyauta",
    description: "Shigar ko buga Brikaya kyauta, ba tare da asusu ba kuma ba tare da biya ba; ci gaba yana zama a kan na'urarka kuma ana iya bugawa ba tare da intanet ba bayan ziyarar farko. ba tare da asusu ba.",
    ogDescription: "Zazzage Brikaya — ba tare da asusu ba",
  },
  'zu': {
    title: "Landa i-Brikaya — umdlalo wesiphequluli wamahhala",
    description: "Faka noma udlale i-Brikaya mahhala, ngaphandle kwe-akhawunti futhi ngaphandle kwenkokhelo; inqubekela phambili ihlala kudivayisi futhi ungadlala ungaxhunyiwe ngemva kokuvakasha kokuqala. ngaphandle kwe-akhawunti.",
    ogDescription: "Landa i-Brikaya — ngaphandle kwe-akhawunti",
  },
  'xh': {
    title: "Khuphela i-Brikaya — umdlalo webhrawuza wasimahla",
    description: "Faka okanye udlale i-Brikaya simahla, ngaphandle kweakhawunti kwaye ngaphandle kwentlawulo; inkqubela ihlala kwisixhobo kwaye ungadlala ngaphandle kwe-intanethi emva kotyelelo lokuqala. ngaphandle kweakhawunti.",
    ogDescription: "Khuphela i-Brikaya — ngaphandle kweakhawunti",
  },
  'st': {
    title: "Khoasolla Brikaya — papali ea sebatli ea mahala",
    description: "Kenya kapa bapala Brikaya mahala, ntle le akhaonto ebile ntle le tefo; tsoelo-pele e lula sesebedisweng mme o ka bapala ntle le inthanete kamora ketelo ya pele. ntle le akhaonto.",
    ogDescription: "Khoasolla Brikaya — ntle le akhaonto",
  },
  'tn': {
    title: "Folosa Brikaya — motshameko wa sebatli wa mahala",
    description: "Tsenya kgotsa tshameka Brikaya mahala, ntle le akhaonto le ntle le tuelo; kgatelopele e sala mo sedirisiweng mme o ka tshameka offline morago ga ketelo ya ntlha. ntle le akhaonto.",
    ogDescription: "Folosa Brikaya — ntle le akhaonto",
  },
  'ts': {
    title: "Dawuniloda Brikaya — ntlangu wa browser wa mahala",
    description: "Nghenisa kumbe tlanga Brikaya mahala, handle ka akhawunti naswona handle ka ku hakela; nhluvuko wu sala eka xitirhisiwa naswona u nga tlanga offline endzhaku ka ku endza ko sungula. handle ka akhawunti.",
    ogDescription: "Dawuniloda Brikaya — handle ka akhawunti",
  },
  'ss': {
    title: "Landa Brikaya — umdlalo wesiphequluli wamahhala",
    description: "Faka noma udlale Brikaya mahhala, ngaphandle kwe-akhawunti nangaphandle kwenkokhelo; inqubekela phambili ihlala kudivayisi futhi ungadlala ngaphandle kwe-inthanethi ngemva kokuvakasha kokuqala. ngaphandle kwe-akhawunti.",
    ogDescription: "Landa Brikaya — ngaphandle kwe-akhawunti",
  },
  've': {
    title: "Dzhia Brikaya — mutambo wa browser wa mahala",
    description: "Longelani kana tambani Brikaya mahala, hu si na akhaunthu na hu si na mbadelo; mvelaphanda i sala kha tshishumiswa nahone ni nga tamba offline nga murahu ha u dalela lwa u thoma. hu si na akhaunthu.",
    ogDescription: "Dzhia Brikaya — hu si na akhaunthu",
  },
  'nso': {
    title: "Laolla Brikaya — papadi ya sebatli ya mahala",
    description: "Tsenya goba bapala Brikaya mahala, ntle le akhaonto le ntle le tefo; tšwelopele e dula sedirišweng gomme o ka bapala offline ka morago ga ketelo ya mathomo. ntle le akhaonto.",
    ogDescription: "Laolla Brikaya — ntle le akhaonto",
  },
  'rw': {
    title: "Kuramo Brikaya — umukino wa mushakisha w'ubuntu",
    description: "Shyira Brikaya cyangwa uyikine ku buntu, nta konti kandi nta kwishyura; iterambere riguma ku gikoresho kandi ushobora gukina udafite interineti nyuma y'uruzinduko rwa mbere. nta konti.",
    ogDescription: "Kuramo Brikaya — nta konti",
  },
  'rn': {
    title: "Manura Brikaya — urukino rwa mucukumbuzi ku buntu",
    description: "Shiramwo canke ukine Brikaya ku buntu, ata konti kandi ata kuriha; iterambere riguma ku gikoresho kandi ushobora gukina utari kuri interineti inyuma y'ugusura kwa mbere. ata konti.",
    ogDescription: "Manura Brikaya — ata konti",
  },
  'ln': {
    title: "Zwa Brikaya — lisano ya navigateur ya ofele",
    description: "Tyá to sambá Brikaya ofele, konto te mpe mbongo te; bokoli etikala na aparɛyi mpe okoki kosakana offline nsima ya botali ya liboso. konto te.",
    ogDescription: "Zwa Brikaya — konto te",
  },
  'lg': {
    title: "Wanula Brikaya — omuzannyo gwa browser ogw'obwereere",
    description: "Teekamu oba zannya Brikaya ku bwereere, awatali akawunti era awatali kusasula; enkulaakulana esigala ku kyuma era osobola okuzannya nga toli ku yintaneeti oluvannyuma lw'okukyalira okusooka. awatali akawunti.",
    ogDescription: "Wanula Brikaya — awatali akawunti",
  },
  'ak': {
    title: "Twe Brikaya — browser agodie a ɛyɛ kwa",
    description: "Fa Brikaya gu wo mfiri so anaa di agoru kwa, konto biara nni ho na sika biara nni ho; nkɔsoɔ no tena wo mfiri so na wubetumi adi agoru offline wɔ nsrahwɛ a edi kan akyi. konto biara nni ho.",
    ogDescription: "Twe Brikaya — konto biara nni ho",
  },
  'ee': {
    title: "Ðe Brikaya — browser ƒe asixɔxɔ dzodzro",
    description: "De Brikaya ɖe mɔ̃ dzi alo nɔ asixɔxɔ me dzodzro, akɔntabubu manɔmee eye fe manɔmee; ŋgɔyiyi nɔa wò mɔ̃ dzi eye àte ŋu adi asixɔxɔ offline le gbãtsɔtsɔ megbe. akɔntabubu manɔmee.",
    ogDescription: "Ðe Brikaya — akɔntabubu manɔmee",
  },
  'tw': {
    title: "Twe Brikaya — browser agodie a ɛyɛ kwa",
    description: "Fa Brikaya gu wo mfiri so anaa di agoru kwa, konto biara nni ho na sika biara nni ho; nkɔsoɔ no tena wo mfiri so na wubetumi adi agoru offline wɔ nsrahwɛ a edi kan akyi. konto biara nni ho.",
    ogDescription: "Twe Brikaya — konto biara nni ho",
  },
  'sn': {
    title: "Dhawunirodha Brikaya — mutambo webhurawuza wemahara",
    description: "Isa kana tamba Brikaya mahara, pasina account uye pasina kubhadhara; kufambira mberi kunoramba kuri pamudziyo uye unogona kutamba offline mushure mekushanya kwekutanga. pasina account.",
    ogDescription: "Dhawunirodha Brikaya — pasina account",
  },
  'ny': {
    title: "Tsitsani Brikaya — masewera a browser aulere",
    description: "Ikani kapena sewerani Brikaya kwaulere, popanda akaunti komanso popanda kulipira; kupita patsogolo kumakhala pa chipangizo ndipo mungasewere offline mutayendera koyamba. popanda akaunti.",
    ogDescription: "Tsitsani Brikaya — popanda akaunti",
  },
  'wo': {
    title: "Yebbi Brikaya — poom navigateur bu amul fay",
    description: "Samp walla fo Brikaya ci lu amul fay, amul kont te amul fay; jëm kanam dina des ci sa jumtukaay te mën nga fo offline ginnaaw seetaan bu njëkk. amul kont.",
    ogDescription: "Yebbi Brikaya — amul kont",
  },
  'ff': {
    title: "Aawto Brikaya — fijirde browser nde yoɓetaake",
    description: "Aaf walla fij Brikaya e ɗuum yoɓetaake, alaa konte e alaa yoɓde; jokkondiral maa hokka e masiŋol maa tee aɗa waawi fijde offline caggal yillagol adan. alaa konte.",
    ogDescription: "Aawto Brikaya — alaa konte",
  },
  'om': {
    title: "Brikaya buusi — tapha browser bilisaa",
    description: "Brikaya bilisaan fe'i ykn taphadhu, herrega malee fi kaffaltii malee; tarkaanfiin meeshaa kee irratti hafa, daawwannaa jalqabaa booda offline taphachuu dandeessa. herrega malee.",
    ogDescription: "Brikaya buusi — herrega malee",
  },
  'ti': {
    title: "Brikaya ኣውርድ — ናጻ ናይ browser ጸወታ",
    description: "Brikaya ብናጻ ጫን ወይ ተጻወት፣ ብዘይ ሒሳብን ብዘይ ክፍሊትን፤ ምዕባለ ኣብ መሳርሒኻ ይቕመጥ እና ድሕሪ ቀዳማይ ምብጻሕ offline ክትጻወት ትኽእል። ብዘይ ሒሳብ.",
    ogDescription: "Brikaya ኣውርድ — ብዘይ ሒሳብ",
  },
};
function metadataFor(locale, routePath) {
  if (routePath === DOWNLOADS_ROUTE_PATH) {
    return DOWNLOADS_SEO[locale] ?? DOWNLOADS_SEO.en;
  }

  return SEO[locale];
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function localePath(locale, routePath = HOME_ROUTE_PATH) {
  if (locale === DEFAULT_LOCALE) return routePath;
  if (routePath === HOME_ROUTE_PATH) return `/${locale}/`;

  return `/${locale}${routePath}`;
}

function canonicalUrl(locale, routePath = HOME_ROUTE_PATH) {
  return `${CANONICAL_ORIGIN}${localePath(locale, routePath)}`;
}

function htmlTagFor(locale) {
  return `<html lang="${locale}" dir="${RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'}">`;
}

function hreflangLinks(routePath = HOME_ROUTE_PATH) {
  return [
    ...LOCALES.map((locale) =>
      `    <link rel="alternate" hreflang="${locale}" href="${canonicalUrl(locale, routePath)}" />`,
    ),
    `    <link rel="alternate" hreflang="x-default" href="${canonicalUrl(DEFAULT_LOCALE, routePath)}" />`,
  ].join('\n');
}

function replaceOrInsertHead(html, locale, routePath = HOME_ROUTE_PATH) {
  const metadata = metadataFor(locale, routePath);
  const canonical = canonicalUrl(locale, routePath);
  return html
    .replaceAll('href="./manifest.webmanifest"', 'href="/manifest.webmanifest"')
    .replaceAll('href="./favicon.svg"', 'href="/favicon.svg"')
    .replaceAll('href="./assets/', 'href="/assets/')
    .replaceAll('src="./assets/', 'src="/assets/')
    .replace(/<html lang="[^"]+"(?: dir="[^"]+")?>/, htmlTagFor(locale))
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeXml(metadata.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeXml(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeXml(metadata.ogDescription)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeXml(metadata.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeXml(metadata.ogDescription)}" />`)
    .replace(/<title>.*<\/title>/, `<title>${escapeXml(metadata.title)}</title>`)
    .replace(/(?:\n    <link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>)+/, '')
    .replace('    <meta name="theme-color"', `${hreflangLinks(routePath)}\n    <meta name="theme-color"`);
}

function buildSitemap() {
  const localizedUrls = LOCALIZED_ROUTES.flatMap((routePath) =>
    LOCALES.map((locale) => [
      '  <url>',
      `    <loc>${canonicalUrl(locale, routePath)}</loc>`,
      `    <lastmod>${LASTMOD}</lastmod>`,
      '  </url>',
    ].join('\n')),
  ).join('\n');
  const staticUrls = STATIC_PUBLIC_PATHS.map((path) => [
    '  <url>',
    `    <loc>${CANONICAL_ORIGIN}${path}</loc>`,
    `    <lastmod>${LASTMOD}</lastmod>`,
    '  </url>',
  ].join('\n')).join('\n');
  const urls = `${localizedUrls}\n${staticUrls}`;
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function run() {
  const distRoot = resolve(process.cwd(), DIST_DIR);
  const rootIndexPath = join(distRoot, INDEX_FILE);
  const baseHtml = readFileSync(rootIndexPath, 'utf8');

  for (const routePath of LOCALIZED_ROUTES) {
    for (const locale of LOCALES) {
      const localizedHtml = replaceOrInsertHead(baseHtml, locale, routePath);
      const outputPath = routePath === HOME_ROUTE_PATH
        ? (locale === DEFAULT_LOCALE ? rootIndexPath : join(distRoot, locale, INDEX_FILE))
        : join(distRoot, localePath(locale, routePath).replace(/^\//, ''), INDEX_FILE);
      writeFile(outputPath, localizedHtml);
    }
  }

  writeFile(join(distRoot, SITEMAP_FILE), buildSitemap());
  writeFile(join(distRoot, ROBOTS_FILE), `User-agent: *\nAllow: /\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`);
  console.log(`localized-seo ok: locales=${LOCALES.length}, routes=${LOCALIZED_ROUTES.length}`);
}

run();
