// language: JavaScript, file: tests/e2e/cloaker_e2e_test.js, target: Node test runner
// *Testes E2E do cloaker — simula requisições HTTP e verifica as decisões.

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';

const E2E_CONFIG = {
  mode: 'moderate',
  blockSearchBots: true,
  customBlockedUAs: [],
  whitelistedIPs: [],
  sessionLifetime: 1800,
  exemptPaths: ['/api/config/', '/api/lead/', '/api/logs/', '/api/proxy/', '/_next/', '/_vercel/', '/admin/', '/health', '/favicon.ico', '/api/cloak/token', '/capture'],
  leadCaptureUrl: '/capture',
  bypassToken: null,
  decoyUrl: 'https://www.tiktok.com',
  strictTiktokBots: [
    'TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker',
    'omnilabs', 'bytedance', 'ByteDance', 'ByteDance-InstaFeed-Jackson', 'TikTok Download Video',
  ],
  forceMobileOnly: true,
  blockEmulators: true,
  bypassParam: 'bypass',
  bypassSessionLifetime: 2592000,
};

const moduleCache = new Map();

function makeRequest(url, headers = {}, method = 'GET') {
  return new Request(url, { headers, method });
}

function getModuleKey() {
  return 'cloakIndex';
}

function clearModuleCache() {
  moduleCache.clear();
}

// Wrapper do import que permite "recarregar" forçando a leitura fresca do config via handler.readConfig
async function importCloak() {
  const key = getModuleKey();
  if (!moduleCache.has(key)) {
    const mod = await import('../../app/api/cloak/index.js');
    moduleCache.set(key, mod);
  }
  return moduleCache.get(key);
}

beforeEach(() => {
  if (!fs.existsSync(path.join(process.cwd(), '.cloaker'))) {
    fs.mkdirSync(path.join(process.cwd(), '.cloaker'), { recursive: true });
  }
  fs.writeFileSync(path.join(process.cwd(), '.cloaker', 'config.json'), JSON.stringify(E2E_CONFIG));
  clearModuleCache();
});

describe('Cloaker E2E', () => {
  test('mobile + params completos TikTok -> ALLOWED', async () => {
    const req = makeRequest(
      'http://localhost/api/cloak/?utm_source=tiktok&utm_campaign=campanha_teste&utm_medium=cpc&utm_content=anuncio_01',
      { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }
    );
    const handler = (await importCloak()).default;
    const res = await handler(req);
    const location = res.headers.get('location');
    assert.equal(res.status, 302);
    assert.ok(location?.endsWith('/'), 'deve redirecionar para a pagina de vendas');
  });

  test('mobile Android + params completos TikTok -> ALLOWED', async () => {
    const req = makeRequest(
      'http://localhost/api/cloak/?utm_source=tiktok&utm_campaign=campanha_teste&utm_medium=cpc&utm_content=anuncio_01',
      { 'user-agent': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' }
    );
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 302);
    assert.ok(res.headers.get('location')?.endsWith('/'));
  });

  test('desktop Windows -> DESKTOP_BLOCKED (403)', async () => {
    const req = makeRequest(
      'http://localhost/api/cloak/?utm_source=tiktok&utm_campaign=campanha_teste&utm_medium=cpc&utm_content=anuncio_01',
      { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    );
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'DESKTOP_BLOCKED');
  });

  test('desktop Mac -> DESKTOP_BLOCKED (403)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'DESKTOP_BLOCKED');
  });

  test('bot TikTok -> BOT_BLOCKED (403)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', { 'user-agent': 'TikTok Advertising/1.0' });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'BOT_BLOCKED');
  });

  test('ByteDance bot -> BOT_BLOCKED (403)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', { 'user-agent': 'Mozilla/5.0 (Linux; Android 10; bytedance)' });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'BOT_BLOCKED');
  });

  test('facebook crawler -> BOT_BLOCKED (403)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', { 'user-agent': 'facebookexternalhit/1.1' });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'BOT_BLOCKED');
  });

  test('sqlmap scanner -> BOT_BLOCKED (403)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', { 'user-agent': 'sqlmap/1.5' });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'BOT_BLOCKED');
  });

  test('emulador BlueStacks -> BOT_BLOCKED (403)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', { 'user-agent': 'Mozilla/5.0 (Linux; Android 10; BlueStacks) AppleWebKit Chrome Mobile Safari' });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('X-Cloaker-Decision'), 'BOT_BLOCKED');
  });

  test('mobile sem params -> MODERATE: landing de captura (redirect)', async () => {
    const req = makeRequest('http://localhost/api/cloak/', {
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    const handler = (await importCloak()).default;
    const res = await handler(req);
    assert.equal(res.status, 302);
    assert.ok(res.headers.get('location')?.includes('/capture'), 'deve ir para a landing de captura');
  });

  test('mobile sem params -> STRICT: bloqueado', async () => {
    const originalConfig = fs.readFileSync(path.join(process.cwd(), '.cloaker', 'config.json'), 'utf8');
    try {
      clearModuleCache();
      fs.writeFileSync(path.join(process.cwd(), '.cloaker', 'config.json'), JSON.stringify({ ...E2E_CONFIG, mode: 'strict' }));
      const handler = (await importCloak()).default;
      const req = makeRequest('http://localhost/api/cloak/', {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      });
      const res = await handler(req);
      assert.equal(res.status, 403);
      assert.equal(res.headers.get('X-Cloaker-Decision'), 'MOBILE_BLOCKED');
    } finally {
      fs.writeFileSync(path.join(process.cwd(), '.cloaker', 'config.json'), originalConfig);
      clearModuleCache();
    }
  });

  test('health check -> OK', async () => {
    const req = makeRequest('http://localhost/health');
    const mod = await import('../../app/health/route.js');
    const res = mod.default(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, 'ok');
  });
});
