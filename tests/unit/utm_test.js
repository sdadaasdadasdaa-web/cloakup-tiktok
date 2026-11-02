// language: JavaScript, file: tests/unit/utm_test.js, target: Node test runner
// *Testes unitários para utils/utm.js — validação de cadeia de params do TikTok.

import { test, describe } from 'node:test';
import assert from 'node:assert';
import * as utm from '../../utils/utm.js';

describe('parseParams', () => {
  test('parseia query string', () => {
    const res = utm.parseParams('https://exemplo.com/?utm_source=tiktok&utm_campaign=x');
    assert.equal(res.utm_source, 'tiktok');
    assert.equal(res.utm_campaign, 'x');
  });
});

describe('isFromTikTok', () => {
  test('detecta referer do tiktok.com', () => {
    const headers = new Map([['referer', 'https://www.tiktok.com']]);
    assert.ok(utm.isFromTikTok(headers));
  });

  test('detecta utm_source=tiktok', () => {
    assert.ok(utm.isFromTikTok(new Map(), { utm_source: 'tiktok' }));
  });

  test('facebook nao e tiktok', () => {
    assert.ok(!utm.isFromTikTok(new Map(), { utm_source: 'facebook' }));
  });
});

describe('validateAdParams', () => {
  test('params completos sao validos', () => {
    const res = utm.validateAdParams({
      utm_source: 'tiktok',
      utm_campaign: 'campanha_teste',
      utm_medium: 'cpc',
      utm_content: 'anuncio_01',
    });
    assert.ok(res.isValid);
    assert.equal(res.missing.length, 0);
  });

  test('faltando campaign nao e valido', () => {
    const res = utm.validateAdParams({
      utm_source: 'tiktok',
      utm_medium: 'cpc',
      utm_content: 'anuncio_01',
    });
    assert.ok(!res.isValid);
    assert.ok(res.missing.includes('utm_campaign'));
  });

  test('faltando content nao e valido', () => {
    const res = utm.validateAdParams({
      utm_source: 'tiktok',
      utm_campaign: 'campanha_teste',
      utm_medium: 'cpc',
    });
    assert.ok(!res.isValid);
    assert.ok(res.missing.includes('utm_content'));
  });

  test('alias campaign_id e aceito', () => {
    const res = utm.validateAdParams({
      utm_source: 'tiktok',
      campaign_id: '12345',
      utm_medium: 'cpc',
      utm_content: 'anuncio_01',
    });
    assert.ok(res.isValid);
  });

  test('sem params nao e valido', () => {
    const res = utm.validateAdParams({});
    assert.ok(!res.isValid);
    assert.equal(res.missing.length, 4);
  });
});

describe('getAdDetails', () => {
  test('extrai detalhes do anuncio', () => {
    const res = utm.getAdDetails({
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
});
