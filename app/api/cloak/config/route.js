// language: JavaScript, file: app/api/cloak/config/route.js, target: Next.js 14, Vercel
// *API endpoint: GET/POST /api/cloak/config/* — CRUD da configuracao do cloaker.
//  Exemplos:
//    GET  /api/cloak/config/*       -> retorna a configuracao atual (com campanhas)
//    POST /api/cloak/config/*       -> salva a configuracao (recebe JSON completo)

import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server.js';
import { STORAGE_DIR, storagePath } from '../../storage.js';

const STORAGE_PATH = storagePath('config.json');

const DEFAULT_CONFIG = {
  mode: 'moderate',
  blockSearchBots: true,
  customBlockedUAs: [],
  whitelistedIPs: [],
  sessionLifetime: 1800,
  exemptPaths: ['/api/cloak/', '/api/cloak/config/', '/api/lead/', '/api/logs/', '/api/proxy/', '/_next/', '/_vercel/', '/admin/', '/health', '/favicon.ico'],
  leadCaptureUrl: '/capture',
  bypassToken: null,
  decoyUrl: 'https://www.tiktok.com',
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

// GET — retorna a configuracao atual
export async function GET() {
  try {
    const config = readConfig();
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao ler configuracao', details: e.message });
  }
}

// POST — salva a configuracao (aceita JSON completo)
export async function POST(request) {
  try {
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Corpo da requisição deve ser um objeto JSON' }, { status: 400 });
    }

    // garantir que campaigns seja array
    const newConfig = { ...DEFAULT_CONFIG, ...body };
    newConfig.campaigns = Array.isArray(newConfig.campaigns) ? newConfig.campaigns : [];

    // garantir que as pastas existam
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    fs.writeFileSync(STORAGE_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
    return NextResponse.json({ success: true, config: newConfig });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar configuracao', details: e.message }, { status: 500 });
  }
}
