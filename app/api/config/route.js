// ============================================================
// CLOAKUP - API de Configuração (CRUD de Filtros)
// Estilo CloakUp - Gerencie todos os filtros
// ============================================================
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server.js';

const STORAGE_DIR = path.join(process.cwd(), '.cloaker');
const STORAGE_PATH = path.join(STORAGE_DIR, 'config.json');

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
  geoSettings: { allowedCountries: [], blockedCountries: [] },
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
    if (fs.existsSync(STORAGE_DIR) && fs.existsSync(STORAGE_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
      return { ...DEFAULT_CONFIG, ...loaded };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

function validateAndMerge(body) {
  // Garante que body seja um objeto
  if (typeof body !== 'object' || body === null) {
    return DEFAULT_CONFIG;
  }

  const result = { ...DEFAULT_CONFIG };
  const validKeys = new Set(Object.keys(DEFAULT_CONFIG));

  Object.keys(body).forEach(key => {
    if (validKeys.has(key)) {
      result[key] = body[key];
    }
    // Ignora campos extra (evita corromper o config)
  });

  // Garante estrutura correta
  result.campaigns = Array.isArray(result.campaigns) ? result.campaigns : [];
  result.geoSettings = result.geoSettings || { allowedCountries: [], blockedCountries: [] };
  result.geoSettings.allowedCountries = Array.isArray(result.geoSettings.allowedCountries) ? result.geoSettings.allowedCountries : [];
  result.geoSettings.blockedCountries = Array.isArray(result.geoSettings.blockedCountries) ? result.geoSettings.blockedCountries : [];

  return result;
}

export async function GET(request) {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Corpo da requisição deve ser um objeto JSON' }, { status: 400 });
    }

    const newConfig = validateAndMerge(body);

    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    fs.writeFileSync(STORAGE_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
    return NextResponse.json({ success: true, config: newConfig });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar configuração', details: e.message }, { status: 500 });
  }
}
