// language: JavaScript, file: app/health/route.js, target: Next.js 14, Vercel
// *Health check — monitoramento e verificação de integridade do cloaker.
//  Rota isenta: /health
//  API Route (não é Server Component) — pode retornar Response.

export function GET() {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'cloakup-tiktok-ads',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: 'online',
    node: process.version,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const runtime = 'nodejs';

// Default export para compatibilidade com app/health/page.js alias (E2E test)
