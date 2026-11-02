import { validateAdParams } from './utils/utm.js';

console.log('Utils importado com sucesso!');
const res = validateAdParams({
  utm_source: 'tiktok',
  utm_campaign: 'campanha_teste',
  utm_medium: 'cpc',
  utm_content: 'anuncio_01',
});
console.log('validateAdParams result:', res.isValid, res.missing);
