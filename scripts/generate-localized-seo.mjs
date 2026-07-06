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
  te: {
    title: 'Brikaya — బ్లాక్ బ్రేకర్ ఆర్కేడ్',
    description: 'బ్రౌజర్‌లో Brikaya అనే ఉచిత బ్లాక్ బ్రేకర్ ఆర్కేడ్ ఆడండి; పురోగతి మీ పరికరంలోనే ఉంటుంది, మొదటి సందర్శన తర్వాత ఆఫ్‌లైన్‌లో ఆడవచ్చు.',
    ogDescription: 'బ్లాకులను పగలగొట్టండి, స్థాయిలను దాటండి, పరికరంలో పురోగతితో బ్రౌజర్‌లో ఆడండి.',
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
  'te': {
    title: 'Brikaya డౌన్‌లోడ్ చేయండి — ఉచిత బ్రౌజర్ గేమ్',
    description: 'ఖాతా లేకుండా, చెల్లింపు లేకుండా Brikayaని ఉచితంగా ఇన్‌స్టాల్ చేయండి లేదా ఆడండి; పురోగతి పరికరంలో ఉంటుంది మరియు మొదటి సందర్శన తర్వాత ఆఫ్‌లైన్‌లో ఆడవచ్చు.',
    ogDescription: 'Brikayaని బ్రౌజర్‌లో ఉచితంగా ఆడండి, పరికరంలో ఇన్‌స్టాల్ చేసి ఖాతా లేకుండా కొనసాగండి.',
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
