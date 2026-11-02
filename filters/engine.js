// ============================================================
// CLOAKUP ENGINE - Cascade de Filtros de Alto Nível
// Estilo CloakUp / Therabot para TikTok Ads
// ============================================================
// Cascade de decisão por ordem de prioridade:
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

import { isBot, isMobile, isEmulator, getPlatform, isRealDevice } from '../utils/ua.js';
import { parseParams, isFromTikTok, validateAdParams, getAdDetails } from '../utils/utm.js';
import { detectASN, detectDatacenterIP } from '../utils/ip.js';

// Resultado da cascade: { decision: 'ALLOWED'|'DECOY'|'BLOCKED', reason, target, statusCode }
export class FilterEngine {
  constructor(config) {
    this.config = config;
  }

  async evaluate(request) {
    const result = {
      decision: 'DECOY',
      reason: null,
      filters: [],
      details: {},
    };

    // --- 1. Token bypass (estilo CloakUp) ---
    const bypass = await this.checkBypassToken(request);
    if (bypass.valid) {
      result.decision = 'ALLOWED';
      result.reason = 'BYPASS_TOKEN';
      result.filters.push('bypass');
      return result;
    }

    // --- 2. Whitelist de IPs ---
    const ip = this.getClientIP(request);
    if (this.config.whitelistEnabled && this.config.whitelistIPs.includes(ip)) {
      result.decision = 'ALLOWED';
      result.reason = 'WHITELIST_IP';
      result.filters.push('whitelist');
      return result;
    }

    // --- 3. Blacklist de IPs ---
    if (this.config.blacklistEnabled && this.config.blacklistIPs.includes(ip)) {
      result.decision = 'BLOCKED';
      result.reason = 'BLACKLIST_IP';
      result.filters.push('blacklist');
      result.statusCode = 403;
      return result;
    }

    // --- 4. Bots ---
    const botCheck = this.checkBots(request, ip);
    if (botCheck.blocked) {
      result.decision = 'BLOCKED';
      result.reason = 'BOT_' + botCheck.type;
      result.filters.push('bot');
      result.details.bot = botCheck.type;
      result.statusCode = 403;
      return result;
    }

    // --- 5. Proxy/VPN/Datacenter ---
    if (this.config.proxyEnabled) {
      const proxyCheck = this.checkProxy(request, ip);
      if (proxyCheck.blocked) {
        result.decision = 'BLOCKED';
        result.reason = 'PROXY_' + proxyCheck.type;
        result.filters.push('proxy');
        result.details.proxy = proxyCheck.type;
        result.statusCode = 403;
        return result;
      }
    }

    // --- 6. AdSpy/espionagem ---
    if (this.config.adsSpyEnabled) {
      const adspyCheck = this.checkAdsSpy(request);
      if (adspyCheck.blocked) {
        result.decision = 'BLOCKED';
        result.reason = 'ADSPY_' + adspyCheck.type;
        result.filters.push('ads spy');
        result.details.adspy = adspyCheck.type;
        result.statusCode = 403;
        return result;
      }
    }

    // --- 7. Geolocalização ---
    if (this.config.geoEnabled) {
      const geoCheck = this.checkGeo(request);
      if (geoCheck.blocked) {
        result.decision = 'BLOCKED';
        result.reason = 'GEO_' + geoCheck.reason;
        result.filters.push('geo');
        result.details.country = geoCheck.country;
        result.statusCode = 403;
        return result;
      }
      result.details.country = geoCheck.country;
    }

    // --- 8. Dispositivos ---
    const deviceCheck = this.checkDevice(request);
    if (deviceCheck.blocked) {
      result.decision = 'BLOCKED';
      result.reason = 'DEVICE_' + deviceCheck.type;
      result.filters.push('device');
      result.details.device = deviceCheck.type;
      result.statusCode = 403;
      return result;
    }
    result.details.device = deviceCheck.platform;

    // --- 9. Referer ---
    if (this.config.refererEnabled) {
      const refererCheck = this.checkReferer(request);
      if (refererCheck.blocked) {
        result.decision = 'DECOY';
        result.reason = 'REFERER_INVALID';
        result.filters.push('referer');
        result.statusCode = 302;
        return result;
      }
    }

    // --- 10. Parâmetros de URL ---
    const params = parseParams(request.url);
    if (this.config.paramsEnabled) {
      const paramsCheck = this.checkParams(params);
      if (!paramsCheck.isValid) {
        result.decision = 'DECOY';
        result.reason = 'PARAMS_MISSING';
        result.filters.push('params');
        result.details.missing = paramsCheck.missing;
        result.statusCode = 302;
        return result;
      }
      result.details.params = paramsCheck.present;
    }

    // --- 11. Idioma do navegador ---
    if (this.config.langEnabled) {
      const langCheck = this.checkLanguage(request, params);
      if (langCheck.blocked) {
        result.decision = 'DECOY';
        result.reason = 'LANGUAGE_' + langCheck.lang;
        result.filters.push('lang');
        result.details.language = langCheck.lang;
        result.statusCode = 302;
        return result;
      }
    }

    // --- 12. User Agent custom ---
    if (this.config.uaEnabled && this.config.uaPatterns.length > 0) {
      const uaCheck = this.checkUA(request);
      if (uaCheck.blocked) {
        result.decision = 'BLOCKED';
        result.reason = 'UA_CUSTOM';
        result.filters.push('ua');
        result.details.ua = uaCheck.pattern;
        result.statusCode = 403;
        return result;
      }
    }

    // --- 13. ISP (datacenter providers) ---
    if (this.config.ispEnabled) {
      const ispCheck = this.checkISP(request, ip);
      if (ispCheck.blocked) {
        result.decision = 'BLOCKED';
        result.reason = 'ISP_' + ispCheck.type;
        result.filters.push('isp');
        result.details.isp = ispCheck.type;
        result.statusCode = 403;
        return result;
      }
    }

    // --- 14. DECISÃO FINAL ---
    // Se passou por todos os filtros → mobile real legit → BLACK
    result.decision = 'ALLOWED';
    result.reason = 'PASS_ALL_FILTERS';
    result.filters.push('final');
    result.details.ad = getAdDetails(params);
    result.statusCode = 302;
    return result;
  }

  // --- 1. Token bypass ---
  async checkBypassToken(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get(this.config.bypassParam) || searchParams.get('token');
    if (!token) return { valid: false };

    try {
      let secret;
      try {
        const fs = await import('fs');
        const path = await import('path');
        secret = fs.readFileSync(path.join(process.cwd(), '.cloaker', 'bypass_secret.txt'), 'utf8').trim();
      } catch {
        secret = 'cloakup-default-secret-change-me';
      }
      if (!secret) return { valid: false };

      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.jwt.verify(token, secret);
        return { valid: true, payload: decoded };
      } catch {
        // Fallback manual: HMAC('cloakup.' + payload)
        const crypto = await import('crypto');
        const parts = token.split('.');
        if (parts.length !== 3) return { valid: false };
        const [header, payload, signature] = parts;
        if (header !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') return { valid: false };
        const computed = crypto.createHmac('sha256', secret).update('cloakup.' + payload).digest('base64');
        if (computed !== signature) return { valid: false };
        const decoded = JSON.parse(Buffer.from(payload, 'base64'));
        if (decoded.exp && decoded.exp < Date.now() / 1000) return { valid: false, reason: 'expired' };
        return { valid: true, payload: decoded };
      }
    } catch {
      return { valid: false };
    }
  }

  // --- Helpers ---
  getClientIP(request) {
    const headers = request.headers;
    return headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      headers.get('x-real-ip') ||
      request.socket?.remoteAddress?.replace('^::ffff:', '') ||
      'unknown';
  }

  // --- 4. Bots ---
  checkBots(request, ip) {
    const ua = request.headers.get('user-agent') || '';
    const uaLower = ua.toLowerCase();

    // Bots do TikTok/ByteDance (sempre bloqueia)
    for (const sig of this.config.strictTiktokBots || []) {
      if (uaLower.includes(sig.toLowerCase())) {
        return { blocked: true, type: 'TIKTOK_' + sig.replace(/\s/g, '_') };
      }
    }

    const botCheck = isBot(ua, { ignoreBots: this.config.blockSearchBots ? [] : ['Googlebot', 'Bingbot'] });
    if (botCheck.isBot) {
      return { blocked: true, type: 'BOT_' + (botCheck.type || 'UNKNOWN') };
    }

    // Bots custom
    for (const custom of this.config.customBlockedUAs || []) {
      if (uaLower.includes(custom.toLowerCase())) {
        return { blocked: true, type: 'BOT_CUSTOM' };
      }
    }

    // Emuladores
    if (this.config.blockEmulators && isEmulator(ua)) {
      return { blocked: true, type: 'BOT_EMULATOR' };
    }

    return { blocked: false };
  }

  // --- 5. Proxy/VPN/Datacenter ---
  checkProxy(request, ip) {
    if (!ip || ip === 'unknown') return { blocked: false };

    const type = detectASN(ip);
    if (type === 'datacenter' || type === 'hosting' || type === 'proxy') {
      return { blocked: true, type: (type || 'unknown').toUpperCase() };
    }
    return { blocked: false };
  }

  // --- 6. AdSpy ---
  checkAdsSpy(request) {
    const ua = request.headers.get('user-agent') || '';
    const uaLower = ua.toLowerCase();

    const adspySignatures = ['adspy', 'admonitor', 'adscritical', 'socialblade', 'exolyt', 'trendspottr', 'myaffiliateprogram'];
    for (const sig of adspySignatures) {
      if (uaLower.includes(sig)) {
        return { blocked: true, type: 'ADSPY_' + sig.toUpperCase() };
      }
    }
    return { blocked: false };
  }

  // --- 7. Geolocalização ---
  checkGeo(request) {
    const headers = request.headers;
    let country = headers.get('cf-ipcountry') || headers.get('x-geocluster') || headers.get('x-client-country') ||
                  headers.get('x-ipcountry') || headers.get('cf-ipcc') || headers.get('Fastly-Client-Ip') ||
                  headers.get('True-Client-IP');
    if (!country) return { blocked: false, country: null };

    country = String(country).toUpperCase().slice(0, 2);
    if (!/^[A-Z]{2}$/.test(country)) return { blocked: false, country: null };

    const { allowedCountries, blockedCountries } = this.config.geoSettings;
    if (blockedCountries.includes(country)) {
      return { blocked: true, reason: 'BLOCKED_COUNTRY', country };
    }
    if (allowedCountries.length && !allowedCountries.includes(country)) {
      return { blocked: true, reason: 'ALLOWED_COUNTRY_ONLY', country };
    }
    return { blocked: false, country };
  }

  // --- 8. Dispositivos ---
  checkDevice(request) {
    const ua = request.headers.get('user-agent') || '';

    if (this.config.forceMobileOnly) {
      const platform = getPlatform(ua);
      if (platform !== 'mobile') {
        return { blocked: true, type: 'DESKTOP_TABLET_EMULATOR' };
      }
      if (this.config.blockEmulators && isEmulator(ua)) {
        return { blocked: true, type: 'EMULATOR' };
      }
    }
    return { blocked: false, platform: getPlatform(ua) };
  }

  // --- 9. Referer ---
  checkReferer(request) {
    const host = this.getReferrerHost(request.headers);
    if (!host) {
      return { blocked: true };
    }
    const allowedHosts = ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com', 'm.tiktok.com', 'tiktok.us'];
    if (!allowedHosts.includes(host)) {
      return { blocked: true };
    }
    return { blocked: false };
  }

  getReferrerHost(headers) {
    const referer = headers.get('referer') || headers.get('referrer');
    if (!referer) return null;
    try {
      const url = new URL(referer);
      return url.host;
    } catch {
      return null;
    }
  }

  // --- 10. Parâmetros ---
  checkParams(params) {
    const validation = validateAdParams(params);
    return validation;
  }

  // --- 11. Idioma ---
  checkLanguage(request, params) {
    const acceptLang = request.headers.get('accept-language');
    if (!acceptLang) return { blocked: false };

    const lang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
    const allowedLanguages = this.config.allowedLanguages || [];
    if (allowedLanguages.length && !allowedLanguages.includes(lang)) {
      return { blocked: true, lang };
    }
    return { blocked: false, lang };
  }

  // --- 12. User Agent custom ---
  checkUA(request) {
    const ua = request.headers.get('user-agent') || '';
    const uaLower = ua.toLowerCase();
    for (const pattern of this.config.uaPatterns || []) {
      if (pattern.test(uaLower)) {
        return { blocked: true, pattern };
      }
    }
    return { blocked: false };
  }

  // --- 13. ISP ---
  checkISP(request, ip) {
    if (!ip || ip === 'unknown') return { blocked: false };
    const type = detectASN(ip);
    if (type === 'datacenter' || type === 'hosting') {
      return { blocked: true, type: (type || 'unknown').toUpperCase() };
    }
    return { blocked: false };
  }
}
