import { parseParams, isFromTikTok, validateAdParams, getAdDetails, getReferrerHost } from './utils/utm.js';
import { isBot, isMobile, isEmulator, getPlatform, isRealDevice } from './utils/ua.js';
import assert from 'node:assert';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`✗ ${name}: ${e.message}`);
  }
}

// --- utils/utm.js ---
test('parseParams de query string', () => {
  const res = parseParams('https://exemplo.com/?utm_source=tiktok&utm_campaign=x');
  assert.equal(res.utm_source, 'tiktok');
  assert.equal(res.utm_campaign, 'x');
});

test('isFromTikTok detecta referer tiktok.com', () => {
  const headers = new Map([['referer', 'https://www.tiktok.com']]);
  assert.ok(isFromTikTok(headers));
});

test('isFromTikTok detecta utm_source=tiktok', () => {
  assert.ok(isFromTikTok(new Map(), { utm_source: 'tiktok' }));
});

test('facebook nao e tiktok', () => {
  assert.ok(!isFromTikTok(new Map(), { utm_source: 'facebook' }));
});

test('params completos sao validos', () => {
  const res = validateAdParams({
    utm_source: 'tiktok',
    utm_campaign: 'campanha_teste',
    utm_medium: 'cpc',
    utm_content: 'anuncio_01',
  });
  assert.ok(res.isValid);
  assert.equal(res.missing.length, 0);
});

test('faltando campaign nao e valido', () => {
  const res = validateAdParams({
    utm_source: 'tiktok',
    utm_medium: 'cpc',
    utm_content: 'anuncio_01',
  });
  assert.ok(!res.isValid);
  assert.ok(res.missing.includes('utm_campaign'));
});

test('faltando content nao e valido', () => {
  const res = validateAdParams({
    utm_source: 'tiktok',
    utm_campaign: 'campanha_teste',
    utm_medium: 'cpc',
  });
  assert.ok(!res.isValid);
  assert.ok(res.missing.includes('utm_content'));
});

test('alias campaign_id e aceito', () => {
  const res = validateAdParams({
    utm_source: 'tiktok',
    campaign_id: '12345',
    utm_medium: 'cpc',
    utm_content: 'anuncio_01',
  });
  assert.ok(res.isValid);
});

test('sem params nao e valido', () => {
  const res = validateAdParams({});
  assert.ok(!res.isValid);
  assert.equal(res.missing.length, 4);
});

test('getAdDetails extrai detalhes do anuncio', () => {
  const res = getAdDetails({
    utm_source: 'tiktok',
    utm_campaign: 'verao2026',
    utm_medium: 'cpc',
    utm_content: 'video_001',
    utm_term: 'prancha_eletrica',
  });
  assert.equal(res.source, 'tiktok');
  assert.equal(res.campaign, 'verao2026');
  assert.equal(res.ad, 'video_001');
  assert.equal(res.term, 'prancha_eletrica');
});

// --- utils/ua.js ---
test('mobile iPhone e mobile', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const m = isMobile(ua);
  assert.ok(m.isMobile, 'deve ser mobile');
  assert.equal(getPlatform(ua), 'mobile');
});

test('mobile Android e mobile', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  const m = isMobile(ua);
  assert.ok(m.isMobile, 'deve ser mobile');
  assert.equal(getPlatform(ua), 'mobile');
});

test('desktop Windows e desktop', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  assert.ok(!isMobile(ua).isMobile);
  assert.equal(getPlatform(ua), 'desktop');
});

test('desktop Mac e desktop', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  assert.ok(!isMobile(ua).isMobile);
  assert.equal(getPlatform(ua), 'desktop');
});

test('bot TikTok identificado', () => {
  assert.ok(isBot('TikTok Advertising/1.0', { ignoreBots: ['Googlebot', 'Bingbot'] }).isBot);
});

test('ByteDance bot identificado', () => {
  assert.ok(isBot('Mozilla/5.0 (Linux; Android 10; bytedance) AppleWebKit Chrome Mobile Safari').isBot);
});

test('facebook crawler identificado', () => {
  assert.ok(isBot('facebookexternalhit/1.1', { ignoreBots: ['Googlebot', 'Bingbot'] }).isBot);
});

test('sqlmap scanner identificado', () => {
  assert.ok(isBot('sqlmap/1.5', { ignoreBots: ['Googlebot', 'Bingbot'] }).isBot);
});

test('emulador BlueStacks identificado', () => {
  assert.ok(isEmulator('Mozilla/5.0 (Linux; Android 10; BlueStacks) AppleWebKit Chrome Mobile Safari'));
});

test('real device iPhone', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  assert.ok(isRealDevice(ua));
});

test('Android real device', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  assert.ok(isRealDevice(ua));
});

console.log(`\nResultados: ${passed} passados, ${failed} falhados`);
process.exit(failed > 0 ? 1 : 0);
