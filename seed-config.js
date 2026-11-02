// ============================================================
// SEED SCRIPT - Corrige o .cloaker/config.json automaticamente
// Roda antes/depois do deploy para garantir que o config esteja valido
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const STORAGE_DIR = path.join(__dirname, '.cloaker');
const STORAGE_PATH = path.join(STORAGE_DIR, 'config.json');

function seedConfig() {
  console.log('=== SEED CONFIG ===');
  
  // Cria pasta .cloaker se nao existir
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('Criou pasta .cloaker');
  }
  
  // Se o config nao existe, cria o padrao
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
    console.log('Criou config.json padrao');
    return;
  }
  
  // Se existe, verifica se e valido
  try {
    let current = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
    
    // Mescla com o padrao para garantir todos os campos
    const merged = { ...DEFAULT_CONFIG, ...current };
    // Remove campos invalidos que nao estao no schema (exceto os de campanha)
    const validKeys = new Set(Object.keys(DEFAULT_CONFIG));
    Object.keys(merged).forEach(key => {
      if (!validKeys.has(key) && key !== 'campaigns') {
        delete merged[key];
      }
    });
    
    // Garante que campaigns e um array
    merged.campaigns = Array.isArray(merged.campaigns) ? merged.campaigns : [];
    
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(merged, null, 2), 'utf8');
    console.log('Config.json corrigido e salvo');
  } catch (e) {
    console.error('Erro ao ler config, recriando padrao:', e.message);
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
    console.log('Config.json recriado com padrao');
  }
  
  console.log('=== SEED CONCLUIDO ===');
}

seedConfig();
