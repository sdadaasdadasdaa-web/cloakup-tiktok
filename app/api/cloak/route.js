// ============================================================
// CLOAKUP - Endpoint Principal de Cloaking
// Rota: /api/cloak/*
// ============================================================
// Cascade de decisão estilo CloakUp / Therabot:
//  1. Token bypass (Whitelist secreta)
//  2. Whitelist de IPs
//  3. Blacklist de IPs
//  4. Bots (TikTok/ByteDance/Google/Facebook/scanners/headless)
//  5. Proxy/VPN/Datacenter
//  6. AdSpy/espionagem
//  7. Geolocalização (allowed/blocked countries)
//  8. Dispositivos (mobile-only, emuladores, tablets)
//  9. Referer (tiktok.com obrigatório)
//  10. Parâmetros de URL (utm_source, campaign, medium, content)
//  11. Idioma do navegador (Accept-Language)
//  12. User Agent (assinaturas customizadas)
//  13. ISP (datacenter/proxy providers)
//  14. Decisão final: ALLOWED → BLACK | DECOY → WHITE | BLOCKED → 403
// ============================================================

import { FilterEngine } from '../../../filters/engine.js';
import { getCampaign } from '../../../filters/decisions.js';

const fs = await import('fs');
const pathModule = await import('path');

function join(base, file) {
  return base + '/' + file.replace(/^\//, '');
}

const STORAGE_DIR = join(process.cwd(), '.cloaker');
const CONFIG_PATH = join(STORAGE_DIR, 'config.json');
const LOGS_PATH = join(STORAGE_DIR, 'access.log');

// ============================================================
// LEITURA DE CONFIGURAÇÃO
// ============================================================
const DEFAULT_CONFIG = {
  // Global settings
  brandName: 'CLOAKUP',
  brandSlogan: 'Proteção de tráfego de alto nível para TikTok Ads',
  mode: 'moderate', // 'moderate' | 'strict'

  // Sites
  blackUrl: '',
  whiteUrl: 'https://www.tiktok.com',
  decoyUrl: 'https://www.tiktok.com',
  leadCaptureUrl: '/capture',

  // Whitelist/Blacklist
  whitelistEnabled: true,
  whitelistIPs: [],
  blacklistEnabled: false,
  blacklistIPs: [],

  // Bots
  strictTiktokBots: [
    'TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker',
    'omnilabs', 'bytedance', 'ByteDance', 'ByteDance-InstaFeed-Jackson', 'TikTok Download Video',
  ],
  blockSearchBots: true,
  customBlockedUAs: [],
  blockEmulators: true,

  // Proxy/VPN
  proxyEnabled: true,

  // AdSpy
  adsSpyEnabled: true,

  // Geolocalização
  geoEnabled: true,
  geoSettings: {
    allowedCountries: [],   // [] = permitir todos
    blockedCountries: [],
  },

  // Dispositivos
  forceMobileOnly: true,

  // Referer
  refererEnabled: true,

  // Parâmetros
  paramsEnabled: true,

  // Idioma
  langEnabled: false,
  allowedLanguages: [],

  // User Agent custom
  uaEnabled: false,
  uaPatterns: [],

  // ISP
  ispEnabled: false,

  // Bypass token
  bypassParam: 'bypass',
  bypassSessionLifetime: 2592000, // 30 dias

  // Campaigns
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
// LOGGING
// ============================================================
async function logDecision(request, result) {
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             request.socket?.remoteAddress || 'unknown';
  const platform = getPlatform(ua);
  const campaign = new URL(request.url).searchParams.get('campaign_id');

  const logEntry = {
    event: 'access',
    decision: result.decision,
    reason: result.reason,
    ip,
    platform,
    campaign_id: campaign,
    filters: result.filters,
    details: result.details,
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

function getPlatform(ua) {
  try {
    const { getPlatform } = require('../../../utils/ua.js');
    return getPlatform(ua) || 'unknown';
  } catch {
    return 'unknown';
  }
}

// ============================================================
// RENDERIZAÇÃO DE RESPOSTAS DE BLOQUEIO
// ============================================================
function renderBotBlocked(decision, reason) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Acesso Negado - Segurança</title><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:2rem;}
h1{font-size:2rem;margin-bottom:1rem;}p{color:#888;font-size:1rem;line-height:1.6;}small{margin-top:2rem;font-size:0.85rem;color:#555;}code{background:#1a1a1a;padding:2px 8px;border-radius:4px;font-family:monospace;}
.error-code{color:#e84118;font-size:1.2rem;font-weight:bold;margin-bottom:1rem;}
</style></head><body><div><h1>Acesso Negado</h1>
<div class="error-code">CODE: ${decision}</div>
<p>Seu acesso foi bloqueado por motivos de segurança.<br>
Esta página é protegida contra bots, crawlers automatizados, serviços de espionagem e tráfego indesejado.</p>
<p style="font-size:0.9rem;color:#666;margin-top:1rem;">Motivo: ${reason || 'política de segurança'}</p>
<small>Code: ${decision}_SEC_${Date.now().toString(36).slice(-4)}</small></div></body></html>`;
}

function renderGeoBlocked(country) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Acesso Restrito</title><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:2rem;}
h1{font-size:2rem;margin-bottom:1rem;}p{color:#888;font-size:1rem;line-height:1.6;}small{margin-top:2rem;font-size:0.85rem;color:#555;}
</style></head><body><div><h1>Conteúdo Indisponível na Sua Região</h1>
<p>Desculpe, o conteúdo que você está tentando acessar não está disponível na sua localização geográfica.<br>
<p style="font-size:0.9rem;color:#666;margin-top:1rem;">País detectado: ${country}</p>
<small>Code: GEO_RESTRICTED_${Date.now().toString(36).slice(-4)}</small></div></body></html>`;
}

// ============================================================
// REDIRECIONAMENTOS
// ============================================================
function redirect(target, status = 302) {
  return Response.redirect(target, status);
}

function resolveTarget(request, result, config) {
  const campaignId = new URL(request.url).searchParams.get('campaign_id');

  if (result.decision === 'ALLOWED') {
    // Campanha específica?
    if (campaignId) {
      const camp = config.campaigns.find(c => String(c.campaignId) === String(campaignId));
      if (camp && camp.blackUrl) return camp.blackUrl;
    }
    return config.blackUrl || request.url.split('?')[0] + '/';
  }

  if (result.decision === 'DECOY') {
    if (campaignId) {
      const camp = config.campaigns.find(c => String(c.campaignId) === String(campaignId));
      if (camp && camp.whiteUrl) return camp.whiteUrl;
    }
    return config.whiteUrl || config.decoyUrl || 'https://www.tiktok.com';
  }

  return null; // BLOCKED -> resposta inline
}

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
export default async function handler(request) {
  // Só processa GET (outras rotas são servidas pelo Next.js)
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const config = readConfig();
  const engine = new FilterEngine(config);
  const result = await engine.evaluate(request);

  // Log da decisão (assíncrono, não bloqueia a resposta)
  logDecision(request, result).catch(() => {});

  // --- 1. BLOQUEIO INLINE (403) ---
  if (result.decision === 'BLOCKED') {
    let body;
    if (result.reason === 'GEO_BLOCKED_COUNTRY' || result.reason === 'GEO_ALLOWED_COUNTRY_ONLY') {
      body = renderGeoBlocked(result.details.country);
    } else {
      body = renderBotBlocked(result.reason, result.details.bot || result.details.proxy || result.details.adspy || result.reason);
    }
    return new Response(body, {
      status: result.statusCode || 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-CloakUp-Decision': result.decision,
        'X-CloakUp-Reason': result.reason,
        'X-CloakUp-Filters': result.filters.join(','),
      },
    });
  }

  // --- 2. MOBILE-ONLY STRICT MODE ---
  if (result.decision === 'DECOY' && config.mode === 'strict' && result.reason === 'PARAMS_MISSING') {
    // No modo strict, mobile sem params completos vai direto pro disfarce sem logging excessivo
    return redirect(resolveTarget(request, result, config), 302);
  }

  // --- 3. DECOY (disfarce) ---
  if (result.decision === 'DECOY') {
    return redirect(resolveTarget(request, result, config), 302);
  }

  // --- 4. ALLOWED (oferta real) ---
  return redirect(resolveTarget(request, result, config), 302);
}

export { handler as GET, handler as POST };
