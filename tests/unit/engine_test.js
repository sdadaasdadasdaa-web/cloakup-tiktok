import { test, describe } from 'node:test';
import assert from 'node:assert';
import { FilterEngine } from '../filters/engine.js';

describe('FilterEngine - Cascade de Decisão', () => {
  const baseConfig = {
    bypassParam: 'bypass',
    strictTiktokBots: ['TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker', 'omnilabs', 'bytedance', 'ByteDance'],
    blockSearchBots: true,
    customBlockedUAs: [],
    blockEmulators: true,
    proxyEnabled: true,
    adsSpyEnabled: true,
    geoEnabled: false,
    forceMobileOnly: true,
    refererEnabled: true,
    paramsEnabled: true,
    langEnabled: false,
    uaEnabled: false,
    uaPatterns: [],
    ispEnabled: false,
    whitelistEnabled: false,
    whitelistIPs: [],
    blacklistEnabled: false,
    blacklistIPs: [],
    geoSettings: { allowedCountries: [], blockedCountries: [] },
    allowedLanguages: [],
    campaigns: [],
  };

  const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const androidUA = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  function makeRequest(ua = mobileUA, params = '', ip = '187.123.45.67') {
    return {
      method: 'GET',
      url: 'http://localhost/api/cloak' + params,
      headers: {
        'user-agent': ua,
        'x-forwarded-for': ip,
        'referer': 'https://www.tiktok.com/',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      socket: { remoteAddress: ip },
    };
  }

  test('mobile + params completos -> ALLOWED (BLACK)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest(mobileUA, '?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'ALLOWED');
    assert.equal(result.statusCode, 302);
  });

  test('android + params completos -> ALLOWED (BLACK)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest(androidUA, '?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'ALLOWED');
  });

  test('desktop windows -> BLOCKED (device)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest(desktopUA, '?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('DESKTOP'));
  });

  test('bot tiktok -> BLOCKED (bot)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest('TikTok Advertising/1.0', '?utm_source=tiktok&utm_campaign=cam1');
    const req = makeRequest('TikTok Ads Manager/2.0', '?utm_source=tiktok');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('BOT'));
  });

  test('byteDance bot -> BLOCKED (bot)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest('Mozilla/5.0 (Linux; Android 10; bytedance)', '?utm_source=tiktok');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('BOT'));
  });

  test('emulator bluesystems -> BLOCKED (bot)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest('Mozilla/5.0 (Linux; Android 10; BlueStacks) AppleWebKit Chrome Mobile Safari', '?utm_source=tiktok');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('BOT') || result.reason.includes('EMULATOR'));
  });

  test('mobile sem params -> DECOY (WHITE)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest(mobileUA, '');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'DECOY');
  });

  test('mobile params incompletos -> DECOY (WHITE)', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest(mobileUA, '?utm_source=tiktok&utm_campaign=cam1');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'DECOY');
  });

  test('whitelist IP -> ALLOWED (BLACK)', async () => {
    const config = { ...baseConfig, whitelistEnabled: true, whitelistIPs: ['187.123.45.67'] };
    const engine = new FilterEngine(config);
    const req = makeRequest(desktopUA, '?utm_source=tiktok');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'ALLOWED');
  });

  test('bypass token -> ALLOWED (BLACK)', async () => {
    const crypto = await import('crypto');
    const secret = crypto.randomBytes(32).toString('base64');
    const payload = 'eyJ0eXBlIjoiYnlwYXNzIiwiZXhwIjo5OTk5OTk5OTk5fQ';
    const signature = crypto.createHmac('sha256', secret).update('cloakup.' + payload).digest('base64');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + payload + '.' + signature;

    const config = { ...baseConfig, bypassParam: 'bypass' };
    const engine = new FilterEngine(config);
    const req = makeRequest(desktopUA, '?bypass=' + token);
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'ALLOWED');
  });

  test('ads spy ua -> BLOCKED', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = makeRequest('AdSpy Bot/1.0', '?utm_source=tiktok');
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('ADSPY'));
  });
});

describe('FilterEngine - Geolocation', () => {
  const baseConfig = {
    bypassParam: 'bypass',
    strictTiktokBots: ['TikTok Advertising'],
    blockSearchBots: true,
    customBlockedUAs: [],
    blockEmulators: true,
    proxyEnabled: false,
    adsSpyEnabled: false,
    geoEnabled: true,
    forceMobileOnly: true,
    refererEnabled: false,
    paramsEnabled: true,
    langEnabled: false,
    uaEnabled: false,
    uaPatterns: [],
    ispEnabled: false,
    whitelistEnabled: false,
    whitelistIPs: [],
    blacklistEnabled: false,
    blacklistIPs: [],
    geoSettings: { allowedCountries: [], blockedCountries: [] },
    allowedLanguages: [],
    campaigns: [],
  };

  test('geo blocked country -> BLOCKED', async () => {
    const config = { ...baseConfig, geoSettings: { allowedCountries: [], blockedCountries: ['CN', 'RU'] } };
    const engine = new FilterEngine(config);
    const req = {
      method: 'GET',
      url: 'http://localhost/api/cloak?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1',
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'cf-ipcountry': 'CN',
      },
      socket: { remoteAddress: '1.2.3.4' },
    };
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('GEO'));
    assert.equal(result.details.country, 'CN');
  });

  test('geo allowed country only -> BLOCKED', async () => {
    const config = { ...baseConfig, geoSettings: { allowedCountries: ['BR', 'US'], blockedCountries: [] } };
    const engine = new FilterEngine(config);
    const req = {
      method: 'GET',
      url: 'http://localhost/api/cloak?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1',
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'cf-ipcountry': 'KP',
      },
      socket: { remoteAddress: '1.2.3.4' },
    };
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reason.includes('GEO'));
  });
});

describe('FilterEngine - Language', () => {
  const baseConfig = {
    bypassParam: 'bypass',
    strictTiktokBots: ['TikTok Advertising'],
    blockSearchBots: true,
    customBlockedUAs: [],
    blockEmulators: true,
    proxyEnabled: false,
    adsSpyEnabled: false,
    geoEnabled: false,
    forceMobileOnly: true,
    refererEnabled: false,
    paramsEnabled: true,
    langEnabled: true,
    uaEnabled: false,
    uaPatterns: [],
    ispEnabled: false,
    whitelistEnabled: false,
    whitelistIPs: [],
    blacklistEnabled: false,
    blacklistIPs: [],
    geoSettings: { allowedCountries: [], blockedCountries: [] },
    allowedLanguages: ['pt-br', 'pt-pt', 'en-us'],
    campaigns: [],
  };

  test('language blocked -> DECOY', async () => {
    const config = { ...baseConfig, allowedLanguages: ['pt-br'] };
    const engine = new FilterEngine(config);
    const req = {
      method: 'GET',
      url: 'http://localhost/api/cloak?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1',
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'accept-language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
      socket: { remoteAddress: '1.2.3.4' },
    };
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'DECOY');
    assert.ok(result.reason.includes('LANGUAGE'));
  });
});

describe('FilterEngine - Blacklist', () => {
  const baseConfig = {
    bypassParam: 'bypass',
    strictTiktokBots: ['TikTok Advertising'],
    blockSearchBots: true,
    customBlockedUAs: [],
    blockEmulators: true,
    proxyEnabled: false,
    adsSpyEnabled: false,
    geoEnabled: false,
    forceMobileOnly: true,
    refererEnabled: false,
    paramsEnabled: true,
    langEnabled: false,
    uaEnabled: false,
    uaPatterns: [],
    ispEnabled: false,
    whitelistEnabled: false,
    whitelistIPs: [],
    blacklistEnabled: true,
    blacklistIPs: ['1.2.3.4'],
    geoSettings: { allowedCountries: [], blockedCountries: [] },
    allowedLanguages: [],
    campaigns: [],
  };

  test('blacklist IP -> BLOCKED', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = {
      method: 'GET',
      url: 'http://localhost/api/cloak?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1',
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'x-forwarded-for': '1.2.3.4',
      },
      socket: { remoteAddress: '1.2.3.4' },
    };
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.equal(result.reason, 'BLACKLIST_IP');
  });
});

describe('FilterEngine - Custom UA', () => {
  const baseConfig = {
    bypassParam: 'bypass',
    strictTiktokBots: ['TikTok Advertising'],
    blockSearchBots: true,
    customBlockedUAs: [],
    blockEmulators: true,
    proxyEnabled: false,
    adsSpyEnabled: false,
    geoEnabled: false,
    forceMobileOnly: true,
    refererEnabled: false,
    paramsEnabled: true,
    langEnabled: false,
    uaEnabled: true,
    uaPatterns: [/evilbot/i, /maliciouscrawler/i],
    ispEnabled: false,
    whitelistEnabled: false,
    whitelistIPs: [],
    blacklistEnabled: false,
    blacklistIPs: [],
    geoSettings: { allowedCountries: [], blockedCountries: [] },
    allowedLanguages: [],
    campaigns: [],
  };

  test('custom UA pattern -> BLOCKED', async () => {
    const engine = new FilterEngine(baseConfig);
    const req = {
      method: 'GET',
      url: 'http://localhost/api/cloak?utm_source=tiktok&utm_campaign=cam1&utm_medium=cpc&utm_content=ad1',
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EvilBot/1.0 Mobile/15E148 Safari/604.1',
      },
      socket: { remoteAddress: '1.2.3.4' },
    };
    const result = await engine.evaluate(req);
    assert.equal(result.decision, 'BLOCKED');
    assert.equal(result.reason, 'UA_CUSTOM');
  });
});
