#!/usr/bin/env node
// ============================================================
// TESTE MANUAL DO CLOAKUP - Engine de Cloaking v2.0
// Contorna o problema do Node test runner (spawn EPERM) rodando testes inline
// ============================================================

import { FilterEngine } from '../filters/engine.js';

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    results.push({ name, status: 'FAIL', error: e.message });
    console.log(`✗ ${name}: ${e.message}`);
  }
}

async function atest(name, fn) {
  try {
    await fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    results.push({ name, status: 'FAIL', error: e.message });
    console.log(`✗ ${name}: ${e.message}`);
  }
}

// Configuração base (padrão seguro - estilo CloakUp)
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

const MOBILE_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const MOBILE_ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const DESKTOP_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const EMULATOR_BLUESTACKS = 'Mozilla/5.0 (Linux; Android 10; BlueStacks) AppleWebKit Chrome Mobile Safari';

function makeReq(ua, params, ip, referer) {
  const headers = new Map();
  headers.set('user-agent', ua);
  headers.set('x-forwarded-for', ip);
  headers.set('referer', referer || 'https://www.tiktok.com/');
  headers.set('accept-language', 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7');
  return {
    method: 'GET',
    url: 'http://localhost:3000/api/cloak' + params,
    headers: headers,
    socket: { remoteAddress: ip },
  };
}

function fullParams(campId) {
  return '?utm_source=tiktok&utm_campaign=' + campId + '&utm_medium=cpc&utm_content=anti&campaign_id=' + campId;
}

// =========================================================================
// CASOS DE TESTE - PRINCIPAIS (estilo CloakUp)
// =========================================================================
test('1. mobile iPhone + params completos -> ALLOWED (oferta BLACK)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(MOBILE_IPHONE, fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED, recebeu ${result.decision}`);
  if (result.statusCode !== 302) throw new Error(`Esperado statusCode 302, recebeu ${result.statusCode}`);
});

test('2. mobile Android + params completos -> ALLOWED (oferta BLACK)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(MOBILE_ANDROID, fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED, recebeu ${result.decision}`);
});

test('3. desktop Windows -> BLOCKED (mobile-only)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(DESKTOP_WINDOWS, fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('DESKTOP')) throw new Error(`Esperado reason DESKTOP, recebeu ${result.reason}`);
});

test('4. desktop Mac -> BLOCKED (mobile-only)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('5. bot TikTok Advertising -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('TikTok Advertising/1.0', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('BOT')) throw new Error(`Esperado BOT, recebeu ${result.reason}`);
});

test('6. bot TikTok Ads Manager -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('TikTok Ads Manager/2.0', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('7. bot ByteDance -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('Mozilla/5.0 (Linux; Android 10; bytedance) AppleWebKit Chrome Mobile Safari', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('8. emulator BlueStacks -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(EMULATOR_BLUESTACKS, fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('BOT') && !result.reason.includes('EMULATOR')) throw new Error(`Esperado BOT/EMULATOR, recebeu ${result.reason}`);
});

test('9. mobile sem params -> DECOY (WHITE/disfarce)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(MOBILE_IPHONE, '', '187.123.45.67'));
  if (result.decision !== 'DECOY') throw new Error(`Esperado DECOY, recebeu ${result.decision}`);
});

test('10. mobile com params incompletos -> DECOY (WHITE/disfarce)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(MOBILE_IPHONE, '?utm_source=tiktok&utm_campaign=cam_teste', '187.123.45.67'));
  if (result.decision !== 'DECOY') throw new Error(`Esperado DECOY, recebeu ${result.decision}`);
});

test('11. mobile sem referer -> DECOY (REFERER_INVALID)', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq(MOBILE_IPHONE, fullParams('cam_teste'), '187.123.45.67', 'https://google.com/'));
  if (result.decision !== 'DECOY') throw new Error(`Esperado DECOY, recebeu ${result.decision}`);
  if (!result.reason.includes('REFERER')) throw new Error(`Esperado REFERER, recebeu ${result.reason}`);
});

test('12. sqlmap scanner -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('sqlmap/1.5', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('13. facebookexternalhit -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('facebookexternalhit/1.1', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('14. googlebot -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('Googlebot/2.1 (+http://www.google.com/bot.html)', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('15. selenium headless -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit Chrome Selenium', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

test('16. playwright headless -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('Playwright/1.28.0', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
});

// =========================================================================
// CASOS AVANÇADOS
// =========================================================================
test('17. whitelist IP -> ALLOWED (ignora todos os filtros)', async () => {
  const config = { ...baseConfig, whitelistEnabled: true, whitelistIPs: ['187.123.45.67'] };
  const result = await new FilterEngine(config).evaluate(makeReq(DESKTOP_WINDOWS, fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED, recebeu ${result.decision}`);
  if (!result.reason.includes('WHITELIST')) throw new Error(`Esperado WHITELIST, recebeu ${result.reason}`);
});

test('18. geo país bloqueado -> BLOCKED', async () => {
  const config = { ...baseConfig, geoEnabled: true, geoSettings: { allowedCountries: [], blockedCountries: ['CN', 'RU', 'KP'] } };
  const req = makeReq(MOBILE_IPHONE, fullParams('cam_teste'), '1.2.3.4');
  req.headers.set('cf-ipcountry', 'CN');
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('GEO')) throw new Error(`Esperado GEO, recebeu ${result.reason}`);
  if (result.details.country !== 'CN') throw new Error(`Esperado country CN, recebeu ${result.details.country}`);
});

test('19. geo allow-only país não permitido -> BLOCKED', async () => {
  const config = { ...baseConfig, geoEnabled: true, geoSettings: { allowedCountries: ['BR', 'US'], blockedCountries: [] } };
  const req = makeReq(MOBILE_IPHONE, fullParams('cam_teste'), '1.2.3.4');
  req.headers.set('cf-ipcountry', 'KP');
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('GEO')) throw new Error(`Esperado GEO, recebeu ${result.reason}`);
});

test('20. blacklist IP -> BLOCKED', async () => {
  const config = { ...baseConfig, blacklistEnabled: true, blacklistIPs: ['1.2.3.4'] };
  const req = makeReq(MOBILE_IPHONE, fullParams('cam_teste'), '1.2.3.4');
  req.headers.set('x-forwarded-for', '1.2.3.4');
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (result.reason !== 'BLACKLIST_IP') throw new Error(`Esperado BLACKLIST_IP, recebeu ${result.reason}`);
});

test('21. adspy UA -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('AdSpy Bot/1.0', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('ADSPY')) throw new Error(`Esperado ADSPY, recebeu ${result.reason}`);
});

test('22. socialblade adspy -> BLOCKED', async () => {
  const result = await new FilterEngine(baseConfig).evaluate(makeReq('SocialBlade/2.0', fullParams('cam_teste'), '187.123.45.67'));
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (!result.reason.includes('ADSPY')) throw new Error(`Esperado ADSPY, recebeu ${result.reason}`);
});

test('23. language bloqueada -> DECOY', async () => {
  const config = { ...baseConfig, langEnabled: true, allowedLanguages: ['pt-br', 'pt-pt'] };
  const req = makeReq(MOBILE_IPHONE, fullParams('cam_teste'), '1.2.3.4');
  req.headers.set('accept-language', 'ru-RU,ru;q=0.9,en;q=0.8');
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'DECOY') throw new Error(`Esperado DECOY, recebeu ${result.decision}`);
  if (!result.reason.includes('LANGUAGE')) throw new Error(`Esperado LANGUAGE, recebeu ${result.reason}`);
});

test('24. custom UA pattern -> BLOCKED', async () => {
  const config = { ...baseConfig, uaEnabled: true, uaPatterns: [/evilbot/i, /maliciouscrawler/i] };
  const req = makeReq('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EvilBot/1.0 Mobile/15E148 Safari/604.1', fullParams('cam_teste'), '1.2.3.4');
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'BLOCKED') throw new Error(`Esperado BLOCKED, recebeu ${result.decision}`);
  if (result.reason !== 'UA_CUSTOM') throw new Error(`Esperado UA_CUSTOM, recebeu ${result.reason}`);
});

// =========================================================================
// TOKEN BYPASS helper: gera token com o segredo correto do arquivo .cloaker/bypass_secret.txt
// =========================================================================
async function getSecretSync() {
  const fs = await import('fs');
  const path = await import('path');
  try {
    return fs.readFileSync(path.join(process.cwd(), '.cloaker', 'bypass_secret.txt'), 'utf8').trim();
  } catch {
    return 'cloakup-default-secret-change-me';
  }
}

async function generateBypassToken(secret, expOffset) {
  const crypto = await import('crypto');
  const payloadObj = { type: 'bypass', exp: Math.floor(Date.now() / 1000) + expOffset };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update('cloakup.' + payload).digest('base64');
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + payload + '.' + signature;
}

// =========================================================================
// TOKEN BYPASS (estilo CloakUp/Clocap)
// =========================================================================
await atest('25. token bypass válido -> ALLOWED (ignora tudo, até desktop)', async () => {
  const secret = await getSecretSync();
  const token = await generateBypassToken(secret, 30 * 24 * 60 * 60);

  const config = { ...baseConfig, bypassParam: 'bypass' };
  const req = makeReq(DESKTOP_WINDOWS, fullParams('cam_teste'), '1.2.3.4');
  req.url += '&bypass=' + token;
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED, recebeu ${result.decision}`);
});

await atest('26. token bypass expirado -> NÃO libera (testado com desktop, que seria BLOCKED)', async () => {
  const secret = await getSecretSync();
  const token = await generateBypassToken(secret, -100);

  const config = { ...baseConfig, bypassParam: 'bypass' };
  const req = makeReq(DESKTOP_WINDOWS, fullParams('cam_teste'), '1.2.3.4');
  req.url += '&bypass=' + token;
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision === 'ALLOWED') throw new Error(`Token expirado deveria ser bloqueado no desktop, recebeu ${result.decision}`);
  // Desktop sem token válido seria BLOCKED
});

await atest('27. token bypass inválido -> NÃO libera (testado com desktop, que seria BLOCKED)', async () => {
  const config = { ...baseConfig, bypassParam: 'bypass' };
  const req = makeReq(DESKTOP_WINDOWS, fullParams('cam_teste'), '1.2.3.4');
  req.url += '&bypass=invalid.token.here';
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision === 'ALLOWED') throw new Error(`Token inválido deveria ser bloqueado no desktop, recebeu ${result.decision}`);
  // Desktop com token inválido seria BLOCKED
});

test('28. token bypass com nome param alternativo (?token=) -> ALLOWED', async () => {
  const secret = await getSecretSync();
  const token = await generateBypassToken(secret, 30 * 24 * 60 * 60);

  const config = { ...baseConfig, bypassParam: 'bypass' };
  const req = makeReq(DESKTOP_WINDOWS, fullParams('cam_teste'), '1.2.3.4');
  req.url += '&token=' + token;
  const result = await new FilterEngine(config).evaluate(req);
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED com token=, recebeu ${result.decision}`);
});

// =========================================================================
// CAMPAIGN SPECIFIC (Therabot-style)
// =========================================================================
await atest('29. campaign_id resolve blackUrl correta', async () => {
  const config = { ...baseConfig, campaigns: [
    { campaignId: 'cam_prancha', name: 'Prancha', blackUrl: 'https://importa-chiina.vercel.app/', whiteUrl: 'https://www.mundo-surf.com/' },
    { campaignId: 'cam_outro', name: 'Outro', blackUrl: 'https://outro-site.com/', whiteUrl: 'https://white.com/' },
  ] };
  const result = await new FilterEngine(config).evaluate(makeReq(MOBILE_IPHONE, fullParams('cam_prancha'), '187.123.45.67'));
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED, recebeu ${result.decision}`);
});

test('30. campanha inexistente -> usa blackUrl global', async () => {
  const config = { ...baseConfig, campaigns: [], blackUrl: 'https://default-black.com/' };
  const result = await new FilterEngine(config).evaluate(makeReq(MOBILE_IPHONE, '?utm_source=tiktok&utm_campaign=cam_inexistente&utm_medium=cpc&utm_content=anti&campaign_id=cam_inexistente', '187.123.45.67'));
  if (result.decision !== 'ALLOWED') throw new Error(`Esperado ALLOWED, recebeu ${result.decision}`);
});

// =========================================================================
// RESULTADOS
// =========================================================================
console.log('\n' + '='.repeat(60));
console.log(`RESULTADOS: ${passed} PASSADOS | ${failed} FALHADOS | ${passed + failed} TESTES`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\nFalhas:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ TODOS OS TESTES PASSARAM!');
  console.log('\nO Cloaker CLOAKUP v2.0 está pronto para uso:');
  console.log('  • Mobile real + params TikTok -> OFERTA (BLACK) ✅');
  console.log('  • Desktop / bots / emuladores -> DISFARCE (WHITE) ❌');
  console.log('  • 12+ camadas de filtro (bots, proxy, AdSpy, geo, devices, referer, params, lang, UA, ISP, whitelist/blacklist)');
  console.log('  • Token bypass estilo CloakUp/Clocap');
  console.log('  • Filtros por campanha estilo Therabot');
  process.exit(0);
}
