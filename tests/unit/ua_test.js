// language: JavaScript, file: tests/unit/ua_test.js, target: Node test runner
// *Testes unitários para utils/ua.js — detecção de bots, mobile, emuladores.

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import * as ua from '../../utils/ua.js';

describe('isBot', () => {
  test('detecta bot do TikTok', () => {
    const res = ua.isBot('Mozilla/5.0 (Linux; Android 14) AppleWebKit Chrome Mobile Safari tiktok');
    assert.ok(res.isBot);
    assert.equal(res.type, 'social');
  });

  test('detecta Facebook crawler', () => {
    const res = ua.isBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)');
    assert.ok(res.isBot);
  });

  test('detecta scanner de segurança', () => {
    const res = ua.isBot('sqlmap/1.5');
    assert.ok(res.isBot);
  });

  test('detecta headless browser', () => {
    const res = ua.isBot('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36');
    assert.ok(res.isBot);
  });

  test('usuario normal NAO e bot', () => {
    const res = ua.isBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    assert.ok(!res.isBot);
  });

  test('UA vazio e suspeito', () => {
    const res = ua.isBot('');
    assert.ok(res.isBot);
  });
});

describe('isMobile', () => {
  test('iPhone e mobile', () => {
    const res = ua.isMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    assert.ok(res.isMobile);
    assert.equal(res.platform, 'iOS');
  });

  test('Android e mobile', () => {
    const res = ua.isMobile('Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');
    assert.ok(res.isMobile);
    assert.equal(res.platform, 'Android 14');
  });

  test('Windows desktop NAO e mobile', () => {
    const res = ua.isMobile('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    assert.ok(!res.isMobile);
    assert.equal(res.platform, 'desktop');
  });

  test('Mac desktop NAO e mobile', () => {
    const res = ua.isMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    assert.ok(!res.isMobile);
  });
});

describe('isEmulator', () => {
  test('BlueStacks e emulador', () => {
    assert.ok(ua.isEmulator('Mozilla/5.0 (Linux; Android 10; BlueStacks) AppleWebKit Chrome Mobile Safari'));
  });

  test('Genymotion e emulador', () => {
    assert.ok(ua.isEmulator('Mozilla/5.0 (Linux; Android 9; Genymotion) AppleWebKit Chrome Mobile Safari'));
  });

  test('iPhone real NAO e emulador', () => {
    assert.ok(!ua.isEmulator('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'));
  });
});

describe('getPlatform', () => {
  test('retorna mobile para iPhone', () => {
    assert.equal(ua.getPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'), 'mobile');
  });

  test('retorna mobile para Android', () => {
    assert.equal(ua.getPlatform('Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'), 'mobile');
  });

  test('retorna desktop para iPad (mobile-only estrito)', () => {
    assert.equal(ua.getPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'), 'desktop');
  });

  test('retorna desktop para Android Tablet', () => {
    assert.equal(ua.getPlatform('Mozilla/5.0 (Linux; Android 10; Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'), 'desktop');
  });

  test('retorna desktop para Windows', () => {
    assert.equal(ua.getPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'), 'desktop');
  });
});

describe('isRealDevice', () => {
  test('iPhone real e dispositivo real', () => {
    assert.ok(ua.isRealDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'));
  });

  test('Android real e dispositivo real', () => {
    assert.ok(ua.isRealDevice('Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'));
  });

  test('emulador NAO e dispositivo real', () => {
    assert.ok(!ua.isRealDevice('Mozilla/5.0 (Linux; Android 10; BlueStacks) AppleWebKit Chrome Mobile Safari'));
  });

  test('bot NAO e dispositivo real', () => {
    assert.ok(!ua.isRealDevice('TikTok Advertising/1.0'));
  });
});
