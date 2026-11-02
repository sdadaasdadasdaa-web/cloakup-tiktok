// language: JavaScript, file: utils/utm.js, target: Vercel Edge + Node runtime
// *Valida a cadeia de parâmetros do anúncio do TikTok.
//  Configurações adaptáveis pela interface de admin*

import { parse as parseUrl } from 'url';

const TIKTOK_REQUIRED_UTM = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content'];

const TIKTOK_ALIASES = {
  utm_source: ['utm_source', 'src', 'source', 'u', 'fbclid', 'gad_source', 'gclid'],
  utm_campaign: ['utm_campaign', 'campaign_id', 'c', 'camp'],
  utm_medium: ['utm_medium', 'm', 'medium', 'adtype'],
  utm_content: ['utm_content', 'ad_id', 'adid', 'a', 'creative'],
  utm_term: ['utm_term', 'keyword', 'kw'],
};

const TIKTOK_REFERER_HOSTS = [
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'm.tiktok.com',
  'tiktok.us',
];

export function parseParams(url) {
  const { query } = parseUrl(url, true);
  return query || {};
}

export function getReferrerHost(headers) {
  const referer = headers.get('referer') || headers.get('referrer');
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return url.host;
  } catch {
    return null;
  }
}

export function isFromTikTok(headers, params = {}) {
  const host = getReferrerHost(headers);
  if (host && TIKTOK_REFERER_HOSTS.includes(host)) return true;
  const src = String(params.utm_source || '').toLowerCase();
  return src === 'tiktok' || src.includes('tiktok');
}

export function validateAdParams(params, config = {}) {
  const { required = TIKTOK_REQUIRED_UTM, minLen = 1 } = config;
  const missing = [];
  const present = {};

  for (const field of required) {
    let value = params[field];
    if (value == null && TIKTOK_ALIASES[field]) {
      for (const alias of TIKTOK_ALIASES[field]) {
        if (params[alias]) {
          value = params[alias];
          break;
        }
      }
    }
    if (value == null || String(value).length < minLen) {
      missing.push(field);
    } else {
      present[field] = value;
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    present,
  };
}

export function isValidUtmChain(params) {
  const keys = Object.keys(params);
  return keys.length >= 1;
}

export function getAdDetails(params) {
  return {
    source: params.utm_source || '-',
    campaign: params.utm_campaign || '-',
    campaignId: params.utm_campaign_id || params.campaign_id || '-',
    adset: params.utm_adset || params.adset_name || '-',
    ad: params.utm_content || params.ad_id || params.ad_name || '-',
    term: params.utm_term || params.keyword || '-',
    placement: params.utm_placement || params.placement || '-',
  };
}
