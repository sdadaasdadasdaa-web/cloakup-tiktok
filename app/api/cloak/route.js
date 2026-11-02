// language: JavaScript, file: app/api/cloak/index.js, target: Next.js 14, Vercel
// *Edge function de cloaking — intercepta cada requisição, aplica filtros em cascata, decide quem entra.
//  Rota: /api/cloak/* (configurada no vercel.json via rewrite)
//  Funcionalidades:
//    1. Bloqueio de bots do TikTok Ads / TikTok Business / ByteDance (sempre)
//    2. Bloqueio de qualquer desktop/notebook (força mobile-only)
//    3. Bloqueio de emuladores / dispositivos virtuais
//    4. Validação da cadeia de params do anúncio TikTok (utm_source=tiktok, campaign, medium, content)
//    5. Token bypass estilo Clocap/CloakUp — URL secreta que libera qualquer dispositivo
//    6. Proteção do gateway — impede que checkout Black seja reportado ao TikTok
//    7. Logs de decisão para auditoria

import { isBot, isMobile, isEmulator, getPlatform } from '../../../utils/ua.js';
import { parseParams, getReferrerHost, isFromTikTok, validateAdParams, getAdDetails } from '../../../utils/utm.js';

const fs = await import('fs');
const pathModule = await import('path');
const crypto = await import('crypto');
const http = await import('http');

function join(base, file) {
  return base + '/' + file.replace(/^\//, '');
}

const STORAGE_DIR = join(process.cwd(), '.cloaker');
const CONFIG_PATH = join(STORAGE_DIR, 'config.json');

// Carrega a lista de campanhas (pode ser chamada várias vezes em runtime)
function getCampaigns() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return Array.isArray(loaded.campaigns) ? loaded.campaigns : [];
    }
  } catch { /* ignore */ }
  return [];
}

// Resolve o objeto campanha por campaign_id
function getCampaign(campaignId) {
  if (!campaignId) return null;
  const campaigns = getCampaigns();
  return campaigns.find(c => String(c.campaignId) === String(campaignId)) || null;
}

// Resolve a URL da campanha correspondente ao campaign_id
function getTargetUrl(campaignId) {
  if (!campaignId) return null;
  const campaigns = getCampaigns();
  const camp = campaigns.find(c => String(c.campaignId) === String(campaignId));
  if (camp && camp.blackUrl) return camp.blackUrl;
  return null;
}


// Carrega variáveis de ambiente de setup inicial (fallback antes do painel/admin)
const env = {
  blackUrl: process.env.NEXT_PUBLIC_BLACK_URL || process.env.CLOAKER_URL || '',
  decoyUrl: process.env.NEXT_PUBLIC_DECOY_URL || '',
  mode: process.env.CLOAKER_MODE || 'moderate',
  secretKey: process.env.CLOAKER_SECRET_KEY || 'default-cloaker-secret-change-me',
  adminIP: process.env.CLOAKER_ADMIN_IP || '',
};

const DEFAULT_CONFIG = {
  brandName: 'Cloaker Genérico',
  brandSlogan: 'Proteção e redirecionamento de tráfego inteligente',
  mode: 'moderate',
  blockSearchBots: true,
  customBlockedUAs: [],
  whitelistedIPs: env.adminIP ? [env.adminIP] : [],
  sessionLifetime: 1800,
  exemptPaths: ['/api/', '/admin/', '/health', '/_next/', '/_vercel/', '/favicon.ico'],
  leadCaptureUrl: '/capture',
  bypassToken: null,
  decoyUrl: 'https://www.tiktok.com', // site branco (disfarce) para bots / bloqueados
  blackUrl: '',
  gatewayProtection: true,
  strictTiktokBots: [
    'TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker',
    'omnilabs', 'bytedance', 'ByteDance', 'ByteDance-InstaFeed-Jackson', 'TikTok Download Video',
  ],
  forceMobileOnly: true,
  blockEmulators: true,
  bypassParam: 'bypass',
  bypassSessionLifetime: 2592000,
  geoSettings: { enabled: false, allowedCountries: [], blockedCountries: [] },
  notifications: { email: '', telegramBotToken: '', telegramChatId: '' },
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      // prioridade: arquivo de config (painel) > fallback de env
      return { ...DEFAULT_CONFIG, ...loaded };
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

let CONFIG = readConfig();

function refreshConfig() {
  CONFIG = readConfig();
}
refreshConfig();

function logDecision(request, decision, meta) {
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             request.socket?.remoteAddress || 'unknown';
  const platform = getPlatform(ua).platform;
  const paramsOk = !!meta.paramsOk;
  const source = request.headers.get('referer') || '-';
  const campaign = new URL(request.url).searchParams.get('campaign_id');

  const logBody = JSON.stringify({
    event: 'access',
    decision,
    ip,
    platform,
    paramsOk,
    source,
    ua: ua.slice(0, 200),
    path: new URL(request.url).pathname,
    campaign_id: campaign,
    ...meta,
  });

  try {
    const u = new URL(request.url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: '/api/logs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(logBody),
        },
      },
      (res) => { /* ignore */ }
    );
    req.on('error', () => {});
    req.write(logBody);
    req.end();
  } catch {
    /* logs assíncronos não podem falhar — fallback silencioso */
  }
}

// Redireciona pra SITE WHITE (disfarce) — bots, desktops e quem não passa
function botBlockedRedirect(campaignId) {
  if (campaignId) {
    const camp = getCampaign(campaignId);
    if (camp && camp.whiteUrl) return Response.redirect(camp.whiteUrl, 302);
  }
  return Response.redirect(CONFIG.decoyUrl || 'https://www.tiktok.com', 302);
}


function allowedResponse(body, decision = 'ALLOWED') {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Cloaker-Decision': decision, 'X-Cloaker-Access': 'true' },
  });
}

function renderBotBlocked() {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Acesso Negado</title><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:2rem;}
h1{font-size:2rem;margin-bottom:1rem;}p{color:#888;font-size:1rem;line-height:1.6;}small{margin-top:2rem;font-size:0.85rem;color:#555;}code{background:#1a1a1a;padding:2px 8px;border-radius:4px;font-family:monospace;}
</style></head><body><div><h1>Acesso Negado</h1>
<p>Seu dispositivo ou navegador não atende aos requisitos de acesso.<br>
Bots, crawlers automatizados e ferramentas de varredura não têm acesso a esta página.</p>
<small>Code: BLOCKED-001</small></div></body></html>`;
}

// Valida token bypass JWT (com fallback manual caso jsonwebtoken nao esteja disponivel)
async function validateBypassToken(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get(CONFIG.bypassParam) || searchParams.get('token');
  if (!token) return null;

  try {
    let secret;
    try {
      secret = fs.readFileSync(join(STORAGE_DIR, 'bypass_secret.txt'), 'utf8').trim();
    } catch {
      secret = 'validate-secret-change-me';
    }
    if (!secret) return { valid: false };

    try {
      const jwtModule = await import('jsonwebtoken');
      const decoded = jwtModule.jwt.verify(token, secret);
      return { valid: true, payload: decoded, token };
    } catch {
      /* jsonwebtoken nao instalado ou token malformatado -> valida manualmente */
    }

    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [header, payload, signature] = parts;
    if (header !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') return { valid: false };

    // Formato compativel: HMAC('cloaker-deep.' + payload)
    const computed = crypto.createHmac('sha256', secret).update('cloaker-deep.' + payload).digest('base64');
    if (computed !== signature) return { valid: false };

    const decoded = JSON.parse(Buffer.from(payload, 'base64'));
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return { valid: false, reason: 'expired' };
    }
    return { valid: true, payload: decoded, token };
  } catch {
    return { valid: false };
  }
}

// Detecta país do visitante por headers de geolocalização (CDN/proxy) com fallback.
// Retorna código ISO 3166-1 alpha-2 (BR, US, PT, ...) ou null.
function getVisitorCountry(req) {
  const headers = req.headers;
  // Cloudflare, AWS ALB, Azure:
  let country = headers.get('cf-ipcountry') || headers.get('x-geocluster') || headers.get('x-client-country') ||
                headers.get('x-ipcountry') || headers.get('cf-ipcc') || headers.get('Fastly-Client-Ip') ||
                headers.get('True-Client-IP');
  if (country) {
    const code = String(country).toUpperCase().slice(0, 2);
    if (/^[A-Z]{2}$/.test(code)) return code;
  }
  return null;
}

export default async function handler(req) {
  refreshConfig();
  const { pathname } = new URL(req.url);
  const baseUrl = new URL(req.url).origin;
  const campaignId = new URL(req.url).searchParams.get('campaign_id');
  const campaign = campaignId ? getCampaign(campaignId) : null;

  // 1. Token bypass (estilo Clocap/CloakUp) — libera qualquer dispositivo
  const bypass = await validateBypassToken(req);
  if (bypass && bypass.valid) {
    logDecision(req, 'ALLOWED_BYPASS', { bypass: true, paramsOk: true });
    const target = CONFIG.blackUrl || baseUrl + '/';
    return Response.redirect(target, 302);
  }

  // 2. Whitelist de IPs (admin, escritório, ferramentas de teste)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             req.headers.get('x-real-ip') ||
             req.socket?.remoteAddress || 'unknown';
  if (CONFIG.whitelistedIPs.includes(ip)) {
    logDecision(req, 'ALLOWED_WHITELIST', { bypass: false, paramsOk: true });
    return allowedResponse('<html><body>IP Whitelisted - Acesso Liberado</body></html>', 'ALLOWED_WHITELIST');
  }

  // 3. Caminhos isentos (admin, assets críticos, token, capture, config API)
  const isExempt = CONFIG.exemptPaths.some(exempt => {
    // EXCEÇÃO: /api/cloak NUNCA é isento (é o próprio cloaker!)
    if (pathname === '/api/cloak' || pathname.startsWith('/api/cloak?')) return false;
    return pathname.startsWith(exempt);
  });
  if (if (isExempt) {
    return new Response('exempt', { status: 200 });
  }

  // 3.5 GEOLOCALIZAÇÃO (configurável): permite ou bloqueia por país do visitante
  if (CONFIG.geoSettings && CONFIG.geoSettings.enabled) {
    const visitorCountry = getVisitorCountry(req);
    if (visitorCountry) {
      const { allowedCountries, blockedCountries } = CONFIG.geoSettings;
      if (blockedCountries.includes(visitorCountry)) {
        logDecision(req, 'DECOY', { geo: 'blocked_country', country: visitorCountry, paramsOk: false });
        return Response.redirect(CONFIG.decoyUrl, 302);
      }
      if (allowedCountries.length && !allowedCountries.includes(visitorCountry)) {
        logDecision(req, 'DECOY', { geo: 'allowed_country_only', country: visitorCountry, paramsOk: false });
        return Response.redirect(CONFIG.decoyUrl, 302);
      }
    }
  }

  // 4. Filtro: bots do TikTok / ByteDance (NUNCA liberar) -> resposta 403 (bloqueio direto)
  const ua = req.headers.get('user-agent') || '';
  const uaLower = ua.toLowerCase();
  for (const sig of CONFIG.strictTiktokBots) {
    if (uaLower.includes(sig.toLowerCase())) {
      logDecision(req, 'BOT_BLOCKED', { bot: sig, paramsOk: false });
      return botBlockedRedirect(campaignId);
    }
  }

  // 5. Bots conhecidos (UA signatures) -> resposta 403 (bloqueio direto)
  const botCheck = isBot(ua, { ignoreBots: CONFIG.blockSearchBots ? [] : ['Googlebot', 'Bingbot'] });
  if (botCheck.isBot) {
    logDecision(req, 'BOT_BLOCKED', { bot: botCheck.type, paramsOk: false });
    return botBlockedRedirect(campaignId);
  }

  // 6. Bots custom + scanners -> resposta 403 (bloqueio direto)
  for (const custom of CONFIG.customBlockedUAs) {
    if (uaLower.includes(custom.toLowerCase())) {
      logDecision(req, 'BOT_BLOCKED', { bot: 'custom', paramsOk: false });
      return botBlockedRedirect(campaignId);
    }
  }

  // 7. Emuladores / dispositivos virtuais -> resposta 403 (bloqueio direto)
  if (CONFIG.blockEmulators && isEmulator(ua)) {
    logDecision(req, 'BOT_BLOCKED', { bot: 'emulator', paramsOk: false });
    return botBlockedRedirect(campaignId);
  }

  // 8. FORÇA MOBILE-ONLY: PC/notebook/any desktop é bloqueado -> redireciona pra SITE WHITE
  if (CONFIG.forceMobileOnly) {
    const platform = getPlatform(ua);
    if (platform === 'desktop') {
      logDecision(req, 'DESKTOP_BLOCKED', { platform: 'desktop', paramsOk: false });
      return botBlockedRedirect(campaignId);
    }
  }

  // 8.5 MODO STRICT: mobile sem params completos -> 403 MOBILE_BLOCKED (bloqueio direto)
  if (CONFIG.mode === 'strict') {
    const params = parseParams(req.url);
    const tiktokSource = isFromTikTok(req.headers, params);
    const adValidation = validateAdParams(params);
    if (!tiktokSource || !adValidation.isValid) {
      logDecision(req, 'MOBILE_BLOCKED', { tiktok: tiktokSource, paramsOk: false });
      return botBlockedRedirect(campaignId);
    }
  }

  // 9. Parse dos params e validação da origem TikTok
  const params = parseParams(req.url);
  const tiktokSource = isFromTikTok(req.headers, params);
  const adValidation = validateAdParams(params);

  // 10. Decisão final
  if (tiktokSource && adValidation.isValid) {
    // Lead válido — libera a página de vendas real (site BLACK)
    logDecision(req, 'ALLOWED', { tiktok: true, paramsOk: true });
    const campaignId = new URL(req.url).searchParams.get('campaign_id');
    let target = getTargetUrl(campaignId);
    if (!target) target = CONFIG.blackUrl || baseUrl + '/';
    return Response.redirect(target, 302);
  }

  // Mobile sem params completos (modo moderate) -> landing de captura
  if (CONFIG.mode === 'moderate') {
    const campaignId = new URL(req.url).searchParams.get('campaign_id');
    let target = getTargetUrl(campaignId);
    if (!target) target = new URL(CONFIG.leadCaptureUrl, req.url).href;
    logDecision(req, 'DECOY', { tiktok: tiktokSource, paramsOk: false, redirect: target });
    return Response.redirect(target, 302);
  }

  // Mobile sem params completos (modo strict fallback) -> site branco (disfarce)
  logDecision(req, 'DECOY', { tiktok: tiktokSource, paramsOk: false });
  return Response.redirect(CONFIG.decoyUrl, 302);
}

// API Route handlers (Next.js App Router) — named exports (padrão Next.js 14)
export { handler as GET, handler as POST };