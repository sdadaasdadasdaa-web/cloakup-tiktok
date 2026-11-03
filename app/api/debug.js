// ============================================================
// CLOAKUP - ROTA DE DEBUG (retorna o config e decisão atual)
// Acesse: https://<seu-domain>/api/debug
// ============================================================

import { readConfig, decide, resolveTarget } from './cloak/route.js';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const config = readConfig();
  const req = request; // reuse a request para decide
  const result = decide(req, config);
  const target = resolveTarget(req, result.decision, config);

  const ua = request.headers.get('user-agent') || '';
  const platform = result.platform || 'unknown';

  return Response.json({
    ok: true,
    debug: true,
    url: request.url,
    userAgent: ua,
    platform: platform,
    decision: result.decision,
    reason: result.reason,
    redirect: target,
    config: {
      blackUrl: config.blackUrl,
      whiteUrl: config.whiteUrl,
      decoyUrl: config.decoyUrl,
      proxyEnabled: config.proxyEnabled,
      refererEnabled: config.refererEnabled,
      paramsEnabled: config.paramsEnabled,
      campaigns: config.campaigns,
      STORAGE_DIR: undefined, // nao exponho
      hasConfigFile: false,
    },
  });
}

export { handler as GET, handler as POST };
