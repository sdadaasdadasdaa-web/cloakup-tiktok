// language: JavaScript, file: utils/ua.js, target: Vercel Edge + Node runtime
// *Detecta bots conhecidos, dispositivos móveis e emuladores.
//  Base de UA atualizada — mantenha sincronizada com config/admin*

const BOT_SIGNATURES = [
  // Bots de redes sociais / anúncio
  'tiktok',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'pinterest',
  'whatsapp',
  'instagram',
  'snapchat',

  // Crawlers de busca (bloqueia bots de indexação, exceto googlebot/bingbot opcionais)
  'googlebot',
  'bingbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'Exabot',
  'facebot',
  'ia_archiver',

  // Ferramentas de scan / teste de segurança
  'nmap',
  'sqlmap',
  'nikto',
  'nessus',
  'acunetix',
  'burp',
  'dirbuster',
  'gobuster',
  'wfuzz',
  'hydra',
  'masscan',
  'zgrab',
  'httpx',
  'subfinder',
  'nuclei',
  'shodan',
  'censys',

  // Monitores de uptime / checker de página
  'uptimerobot',
  'statuscake',
  'checkly',
  'pingdom',
  'site24x7',
  'keycdn',

  // Scrapers / crawlers genéricos
  'python-requests',
  'curl',
  'wget',
  'java/',
  'postman',
  'okhttp',
  'Apache-HttpClient',
  'httpclient',
  'httplib',
  'httpclient',
  'scrapy',
  'phantomjs',
  'headlesschrome',
  'chromedriver',
  'selenium',
  'playwright',
  'puppeteer',
  'whatsapp Business',

  // Bots de verificação de pagamento / marketplace
  'dropchain',
  'webhook',
  'stripe',
  'klarna',
  'adyen',
  'paypal',
];

const MOBILE_UA_PATTERNS = [
  /Android\s([0-9._]+)/i,
  /iPhone/i,
  /Windows\sPhone/,
  /Windows\sNT\s10.0.*Touch/,
  /WebOS/,
  /Bada/,
  /Tizen/,
  /MEEGO/,
  /Symbian/,
  /Mobile.*Safari/,
  /Mobile\/[0-9.]* Safari/,
];

const TABLET_UA_PATTERNS = [
  // Tablets desktop/mobile — para mobile-only estrito, tablet NÃO entra
  // /iPad/i,
  /Android.*Tablet/i,
  /Silk\/([0-9._]+)/,
  /PlayStation Vita/,
  /PlayStation 3/,
  /PlayStation 4/,
];

const EMULATOR_SIGNATURES = [
  'emulator',
  'android emulator',
  'genymotion',
  'boxy',
  'simulator',
  'bluestacks',
  'nox',
  'mumu',
  'ldplayer',
  'memu',
  'droid4x',
  'ares',
  'koala',
  'shenzhen',
];

function parseUA(ua) {
  if (!ua) return { ua: '', normalized: '' };
  const normalized = ua.toLowerCase();
  return { ua, normalized };
}

export function isBot(ua, config = {}) {
  const { ignoreBots = ['Googlebot', 'Bingbot'] } = config;
  const { normalized } = parseUA(ua);

  if (!normalized) return { isBot: true, type: null }; // sem UA = suspeito

  for (const sig of BOT_SIGNATURES) {
    if (normalized.includes(sig.toLowerCase())) {
      if (ignoreBots.some(b => sig.toLowerCase().includes(b.toLowerCase()))) {
        continue;
      }
      return { isBot: true, type: classifyBot(sig, normalized) };
    }
  }
  return { isBot: false, type: null };
}

function classifyBot(sig, normalized) {
  const social = ['tiktok', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 'pinterest', 'instagram', 'whatsapp'];
  if (social.some(s => sig.toLowerCase().includes(s))) return 'social';
  const search = ['googlebot', 'bingbot', 'yandexbot', 'baiduspider'];
  if (search.some(s => sig.toLowerCase().includes(s))) return 'search';
  if (['selenium', 'playwright', 'puppeteer', 'phantomjs', 'chromedriver'].some(s => sig.includes(s))) return 'headless';
  return 'scanner';
}

export function isMobile(ua) {
  const { normalized } = parseUA(ua);
  if (!normalized) return false;

  // Tablets primeiro — Android tablet/Nexus 7/etc. são desktop para mobile-only estrito
  for (const pattern of TABLET_UA_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isMobile: true, platform: 'tablet', ua };
    }
  }

  for (const pattern of MOBILE_UA_PATTERNS) {
    if (pattern.test(normalized)) {
      const match = normalized.match(pattern);
      return { isMobile: true, platform: match[1] ? `Android ${match[1]}` : 'iOS', ua };
    }
  }

  return { isMobile: false, platform: 'desktop', ua };
}

export function isEmulator(ua) {
  const { normalized } = parseUA(ua);
  if (!normalized) return false;
  return EMULATOR_SIGNATURES.some(sig => normalized.includes(sig));
}

export function getPlatform(ua) {
  const mobile = isMobile(ua);
  if (!mobile.isMobile) return 'desktop';
  // Mobile-only estrito: só celulares de verdade entram
  if (mobile.platform === 'tablet') return 'desktop';
  return 'mobile';
}

export function isRealDevice(ua) {
  if (isBot(ua).isBot) return false;
  if (isEmulator(ua)) return false;
  if (!isMobile(ua).isMobile) return false;
  return true;
}
