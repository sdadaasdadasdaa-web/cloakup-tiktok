// ============================================================
// CLOAKUP - Resolvedor de Decisões por Campanha
// ============================================================
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.cloaker');
const CONFIG_PATH = path.join(STORAGE_DIR, 'config.json');

export function getCampaigns() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return Array.isArray(loaded.campaigns) ? loaded.campaigns : [];
    }
  } catch { /* ignore */ }
  return [];
}

export function getCampaign(campaignId) {
  if (!campaignId) return null;
  const campaigns = getCampaigns();
  return campaigns.find(c => String(c.campaignId) === String(campaignId)) || null;
}

export function getTargetUrl(campaignId, blackOrWhite = 'black') {
  if (!campaignId) return null;
  const campaigns = getCampaigns();
  const camp = campaigns.find(c => String(c.campaignId) === String(campaignId));
  if (!camp) return null;
  return camp[blackOrWhite + 'Url'] || null;
}

export function getBrandConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return {
        brandName: loaded.brandName || 'CLOAKUP',
        brandSlogan: loaded.brandSlogan || 'Proteção de tráfego de alto nível para TikTok Ads',
      };
    }
  } catch { /* ignore */ }
  return { brandName: 'CLOAKUP', brandSlogan: 'Proteção de tráfego de alto nível para TikTok Ads' };
}
