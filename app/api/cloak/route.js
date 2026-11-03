// ============================================================
// CLOAKUP - Endpoint Principal de Cloaking
// Rota: /api/cloak/*
// ============================================================
// LÓGICA SIMPLES - Apenas 2 destinos possíveis:
//
//   Desktop/PC (Windows / macOS / Linux / tablet desktop)  -> WHITE URL (pagina branca / decoy)
//   Mobile (Android / iOS / qualquer celular)              -> BLACK URL (site preto / oferta)
//   Bots, crawlers, spiders, scripts, headless            -> WHITE URL
//
// NADA de tela de bloqueio, NADA de redirecionar para TikTok,
// NADA de conectar ao sistema de bloqueio.
// ============================================================

import { isBot, isMobile, isEmulator, getPlatform, isRealDevice } from '../../../utils/ua.js';

const fs = await import('fs');
const { STORAGE_DIR, storagePath } = await import('../storage.js');

const CONFIG_PATH = storagePath('config.json');
const LOGS_PATH = storagePath('access.log');

const DEFAULT_CONFIG = {
  brandName: 'CLOAKUP',
  brandSlogan: 'Proteção de tráfego de alto nível para TikTok Ads',
  mode: 'moderate',

  blackUrl: '',
  whiteUrl: 'https://www.tiktok.com',
  decoyUrl: 'https://www.tiktok.com',
  leadCaptureUrl: '/capture',

  whitelistEnabled: true,
  whitelistIPs: [],
  blacklistEnabled: false,
  blacklistIPs: [],

  strictTiktokBots: [
    'TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker',
    'omnilabs', 'bytedance', 'ByteDance', 'ByteDance-InstaFeed-Jackson', 'TikTok Download Video',
  ],
  blockSearchBots: true,
  customBlockedUAs: [],
  blockEmulators: true,

  proxyEnabled: true,

  adsSpyEnabled: true,

  geoEnabled: true,
  geoSettings: {
    allowedCountries: [],
    blockedCountries: [],
  },

  forceMobileOnly: true,

  refererEnabled: true,
  paramsEnabled: true,
  langEnabled: false,
  allowedLanguages: [],
  uaEnabled: false,
  uaPatterns: [],
  ispEnabled: false,

  bypassParam: 'bypass',
  bypassSessionLifetime: 2592000,

  campaigns: [],
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return { ...DEFAULT_CONFIG, ...loaded };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

// ============================================================
// LOGGING (apenas para auditoria, nunca bloqueia a resposta)
// ============================================================
async function logDecision(request, result) {
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             request.socket?.remoteAddress || 'unknown';
  const platform = result.platform || 'unknown';

  const logEntry = {
    event: 'access',
    decision: result.decision,
    reason: result.reason,
    ip,
    platform,
    campaign_id: new URL(request.url).searchParams.get('campaign_id'),
    filters: result.filters || [],
    ua: ua.slice(0, 200),
    path: new URL(request.url).pathname,
  };

  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString();
    const line = JSON.stringify({ ...logEntry, timestamp, id: Date.now().toString(36) }) + '\n';
    fs.appendFileSync(LOGS_PATH, line, 'utf8');
  } catch { /* logs assíncronos não podem falhar */ }
}

// ============================================================
// MOTOR DE DECISÃO SIMPLES - Apenas 2 destinos: WHITE ou BLACK
// ============================================================
export function decide(request, config) {
  const ua = request.headers.get('user-agent') || '';
  const uaLower = ua.toLowerCase();
  const result = {
    decision: null,     // 'WHITE' | 'BLACK'
    reason: null,
    platform: 'unknown',
    filters: [],
  };

  // --- 0. Token de bypass (permite acessar o site BLACK diretamente, util para voce) ---
  const bypass = new URL(request.url).searchParams.get(config.bypassParam) ||
                 new URL(request.url).searchParams.get('token');
  if (bypass) {
    result.decision = 'BLACK';
    result.reason = 'BYPASS_TOKEN';
    result.filters.push('bypass');
    return result;
  }

  // --- 1. Whitelist de IPs (ACESSO LIBERADO ao BLACK - ex: admin) ---
  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              request.headers.get('x-real-ip') || 'unknown');
  if (config.whitelistEnabled && config.whitelistIPs.includes(ip)) {
    result.decision = 'BLACK';
    result.reason = 'WHITELIST_IP';
    result.filters.push('whitelist');
    return result;
  }

  // --- 2. Detecção de bot / crawler / robot / script / headless ---
  //    Tudo que é automatizado vai para o WHITE (pagina decoy)
  let detectedBot = null;

  // Bots declarados de redes sociais (TikTok Ads, FB, Google...)
  for (const sig of config.strictTiktokBots || []) {
    if (uaLower.includes(sig.toLowerCase())) {
      detectedBot = 'TIKTOK_' + sig.replace(/\s/g, '_');
      break;
    }
  }

  // Bots genéricos (Googlebot, Bingbot, scanners, headless, python, curl, etc)
  if (!detectedBot) {
    const botCheck = isBot(ua, { ignoreBots: [] });
    if (botCheck.isBot) {
      detectedBot = 'BOT_' + (botCheck.type || 'UNKNOWN');
    }
  }

  // Bots custom configuraveis
  if (!detectedBot) {
    for (const custom of config.customBlockedUAs || []) {
      if (uaLower.includes(custom.toLowerCase())) {
        detectedBot = 'BOT_CUSTOM';
        break;
      }
    }
  }

  if (detectedBot) {
    result.decision = 'WHITE';
    result.reason = detectedBot;
    result.filters.push('bot');
    return result;
  }

  // --- 3. Emuladores (Bluestacks, Nox, LDPlayer...) ---
  //    Vao para o WHITE, nao entram na oferta
  if (config.blockEmulators && isEmulator(ua)) {
    result.decision = 'WHITE';
    result.reason = 'EMULATOR';
    result.filters.push('emulator');
    return result;
  }

  // --- 4. Proxy / VPN / Datacenter ---
  //    Se estiver configurado, redireciona pro WHITE em vez de bloquear
  if (config.proxyEnabled) {
    // detectASN retorna 'datacenter' | 'hosting' | 'proxy' | null
    let type = null;
    try {
      const { detectASN } = await import('../../../utils/ip.js');
      type = detectASN(ip);
    } catch { /* sem IPDB, ignora */ }
    if (type === 'datacenter' || type === 'hosting' || type === 'proxy') {
      result.decision = 'WHITE';
      result.reason = type.toUpperCase();
      result.filters.push('proxy');
      return result;
    }
  }

  // --- 5. Geolocalização (se ativa) ---
  //    Paises bloqueados -> WHITE. Paises permitidos -> BLACK.
  if (config.geoEnabled) {
    let country = request.headers.get('cf-ipcountry') ||
                  request.headers.get('x-geocluster') ||
                  request.headers.get('x-client-country') ||
                  request.headers.get('x-ipcountry') ||
                  request.headers.get('cf-ipcc') ||
                  request.headers.get('Fastly-Client-Ip') ||
                  request.headers.get('True-Client-Ip');
    if (country) {
      country = String(country).toUpperCase().slice(0, 2);
      if (/^[A-Z]{2}$/.test(country)) {
        const { allowedCountries, blockedCountries } = config.geoSettings;
        if (blockedCountries.includes(country)) {
          result.decision = 'WHITE';
          result.reason = 'GEO_BLOCKED_COUNTRY_' + country;
          result.filters.push('geo');
          return result;
        }
        if (allowedCountries.length && !allowedCountries.includes(country)) {
          result.decision = 'WHITE';
          result.reason = 'GEO_ALLOWED_ONLY_' + country;
          result.filters.push('geo');
          return result;
        }
      }
    }
  }

  // --- 6. Referer (opcional) ---
  //    Se referer não for das redes permitidas -> WHITE
  if (config.refererEnabled) {
    const referer = request.headers.get('referer') || request.headers.get('referrer');
    let host = null;
    if (referer) {
      try { host = new URL(referer).host; } catch { /* ignora */ }
    }
    if (!host) {
      result.decision = 'WHITE';
      result.reason = 'REFERER_MISSING';
      result.filters.push('referer');
      return result;
    }
    const allowedHosts = ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com', 'm.tiktok.com', 'tiktok.us'];
    if (!allowedHosts.includes(host)) {
      result.decision = 'WHITE';
      result.reason = 'REFERER_INVALID_' + host;
      result.filters.push('referer');
      return result;
    }
  }

  // --- 7. Parâmetros de URL (opcional) ---
  //    Sem params de ad -> WHITE
  if (config.paramsEnabled) {
    const params = new URL(request.url).searchParams;
    const hasParams = params.has('utm_source') || params.has('campaign_id') ||
                      params.has('ad_id') || params.has('adsetId');
    if (!hasParams) {
      result.decision = 'WHITE';
      result.reason = 'PARAMS_MISSING';
      result.filters.push('params');
      return result;
    }
  }

  // --- 8. Idioma (opcional) ---
  if (config.langEnabled) {
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      const allowedLanguages = config.allowedLanguages || [];
      if (allowedLanguages.length && !allowedLanguages.includes(lang)) {
        result.decision = 'WHITE';
        result.reason = 'LANGUAGE_' + lang;
        result.filters.push('lang');
        return result;
      }
    }
  }

  // --- 9. User Agent custom (opcional) ---
  if (config.uaEnabled) {
    const uaPatterns = config.uaPatterns || [];
    for (const pattern of uaPatterns) {
      if (pattern.test && pattern.test(uaLower)) {
        result.decision = 'WHITE';
        result.reason = 'UA_CUSTOM';
        result.filters.push('ua');
        return result;
      }
    }
  }

  // ============================================================
  // DECISÃO FINAL POR DISPOSITIVO
  // ============================================================
  const platform = getPlatform(ua);

  // Desktop, Mac, Linux, tablet desktop, console -> WHITE (pagina decoy / protegida)
  if (platform === 'desktop' || platform === 'mac' || platform === 'linux' || platform === 'windows' || platform === 'console') {
    result.decision = 'WHITE';
    result.reason = 'DESKTOP';
    result.platform = platform;
    result.filters.push('device');
    return result;
  }

  // Mobile real (Android, iOS, celular) -> BLACK (site preto / oferta)
  if (platform === 'mobile') {
    result.decision = 'BLACK';
    result.reason = 'MOBILE_REAL';
    result.platform = platform;
    result.filters.push('device');
    return result;
  }

  // Qualquer outra assinatura (UA desconhecido, mobile ambiguous) -> WHITE por padrao
  result.decision = 'WHITE';
  result.reason = 'UNKNOWN_PLATFORM';
  result.platform = platform || 'unknown';
  result.filters.push('default');
  return result;
}

// ============================================================
// REDIRECIONAMENTO
// ============================================================
function resolveTarget(request, decision, config) {
  const campaignId = new URL(request.url).searchParams.get('campaign_id');

  if (decision === 'BLACK') {
    if (campaignId) {
      const camp = config.campaigns.find(c => String(c.campaignId) === String(campaignId));
      if (camp && camp.blackUrl) return camp.blackUrl;
    }
    return config.blackUrl || 'https://www.tiktok.com';
  }

  // WHITE por padrão
  if (campaignId) {
    const camp = config.campaigns.find(c => String(c.campaignId) === String(campaignId));
    if (camp && camp.whiteUrl) return camp.whiteUrl;
  }
  return config.whiteUrl || config.decoyUrl || 'https://www.tiktok.com';
}

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const config = readConfig();
  const result = decide(request, config);

  // Log da decisão (assíncrono, não bloqueia)
  logDecision(request, result).catch(() => {});

  // Redireciona para o destino correto: WHITE ou BLACK
  const target = resolveTarget(request, result.decision, config);

  return Response.redirect(target, 302);
}

export { handler as GET, handler as POST };
