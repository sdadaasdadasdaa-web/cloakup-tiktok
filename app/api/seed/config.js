// ============================================================
// API de SEED - Corrige o .cloaker/config.json se estiver corrompido
// Rodar: POST /api/seed/config
// ============================================================

import { NextResponse } from 'next/server.js';
import fs from 'fs';
import path from 'path';
import { STORAGE_DIR, storagePath } from '../storage.js';

const STORAGE_PATH = storagePath('config.json');

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
  strictTiktokBots: ['TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker', 'omnilabs', 'bytedance', 'ByteDance', 'ByteDance-InstaFeed-Jackson', 'TikTok Download Video'],
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

export async function POST() {
  try {
    // Cria pasta .cloaker se necessario
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    // Se nao tem config, cria o padrao
    if (!fs.existsSync(STORAGE_PATH)) {
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
      return NextResponse.json({ success: true, message: 'Config criado do padrao', config: DEFAULT_CONFIG });
    }

    // Tenta ler o config atual
    let current;
    try {
      current = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
    } catch {
      current = {};
    }

    // Mescla com padrao e remove campos invalidos
    const validKeys = new Set(Object.keys(DEFAULT_CONFIG));
    const merged = { ...DEFAULT_CONFIG, ...current };
    Object.keys(merged).forEach(key => {
      if (!validKeys.has(key) && key !== 'campaigns') {
        delete merged[key];
      }
    });
    merged.campaigns = Array.isArray(merged.campaigns) ? merged.campaigns : [];
    merged.geoSettings = merged.geoSettings || { allowedCountries: [], blockedCountries: [] };
    merged.geoSettings.allowedCountries = Array.isArray(merged.geoSettings.allowedCountries) ? merged.geoSettings.allowedCountries : [];
    merged.geoSettings.blockedCountries = Array.isArray(merged.geoSettings.blockedCountries) ? merged.geoSettings.blockedCountries : [];

    fs.writeFileSync(STORAGE_PATH, JSON.stringify(merged, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Config corrigido', config: merged });
  } catch (e) {
    return NextResponse.json({ error: 'Erro no seed', details: e.message }, { status: 500 });
  }
}