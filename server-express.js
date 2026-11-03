#!/usr/bin/env node
// ============================================================
// SERVIDOR FALLBACK - EXPRESS
// ============================================================
// Serve as rotas API (/api/*) quando o Next.js náo inicia
// (spawn EPERM no shell desta ferramenta).
// ============================================================

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Importar handlers das rotas API do Next.js
const cloak = await import('./app/api/cloak/route.js');
const config = await import('./app/api/config/route.js');
const logs = await import('./app/api/logs/route.js');
const lead = await import('./app/api/lead/route.js');
const proxy = await import('./app/api/proxy/route.js');
const token = await import('./app/api/cloak/token.js');

console.log('Handlers API importados OK');

// Helper para responder com NextResponse
function respond(res, next, r) {
  const rBody = r.body;
  let bodyToSend = rBody;
  if (!bodyToSend) {
    try {
      bodyToSend = typeof r === 'string' ? r : JSON.stringify(r);
    } catch (e) {
      bodyToSend = JSON.stringify({ error: 'internal_error' });
    }
  }
  // Normalizar headers
  const headers = {};
  if (r.headers && typeof r.headers.get === 'function') {
    for (const key of r.headers.keys()) {
      headers[key] = r.headers.get(key);
    }
  } else if (r.headers) {
    Object.assign(headers, r.headers);
  }
  res.set(headers);
  res.status(r.status || 200);
  res.send(bodyToSend);
}

// Rotas API
app.all('/api/cloak', (req, res, next) => {
  const h = req.method === 'POST' ? cloak.POST : cloak.GET;
  h(req).then(r => respond(res, next, r)).catch(next);
});

app.all('/api/cloak/token', (req, res, next) => {
  const h = req.method === 'POST' ? token.POST : token.GET;
  h(req).then(r => respond(res, next, r)).catch(next);
});

app.all('/api/config', (req, res, next) => {
  const h = req.method === 'POST' ? config.POST : config.GET;
  h(req).then(r => respond(res, next, r)).catch(next);
});

app.all('/api/logs', (req, res, next) => {
  const h = req.method === 'POST' ? logs.POST : logs.GET;
  h(req).then(r => respond(res, next, r)).catch(next);
});

app.all('/api/lead', (req, res, next) => {
  const h = req.method === 'POST' ? lead.POST : lead.GET;
  h(req).then(r => respond(res, next, r)).catch(next);
});

app.all('/api/proxy', (req, res, next) => {
  const h = req.method === 'POST' ? proxy.POST : proxy.GET;
  h(req).then(r => respond(res, next, r)).catch(next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cloakup-tiktok-ads', version: '2.0.0', mode: 'express-fallback' });
});

// Vitrine fallback
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Proteção de Tráfego v2.0</title></head>
<body style="background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;text-align:center;">
  <h1 style="color:#4fd1c2">Proteção de Tráfego v2.0 - Fallback</h1>
  <p>O servidor Next.js náo pôde iniciar completamente (spawn EPERM nesta ferramenta).</p>
  <p>Rotas API disponiveis. Para o painel completo: abra um terminal e rode <code>npm run dev</code>.</p>
  <ul style="text-align:left;display:inline-block;margin-top:20px;">
    <li><a href="/health" style="color:#4fd1c2">/health</a> - health check</li>
    <li><a href="/api/cloak" style="color:#4fd1c2">/api/cloak</a> - teste de cloaking</li>
    <li><a href="/api/logs" style="color:#4fd1c2">/api/logs</a> - logs de acesso</li>
    <li><a href="/api/config" style="color:#4fd1c2">/api/config</a> - configuracao</li>
  </ul>
</body>
</html>`);
});

// Painel fallback
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Admin - Fallback</title></head>
<body style="background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;">
  <h1 style="color:#4fd1c2">Admin Proteção de Tráfego v2.0 - Modo Fallback</h1>
  <p style="color:#f56565">O painel interativo náo está disponível neste modo.</p>
  <p>Para usar o painel completo, abra um terminal e rode <code>npm run dev</code>, depois acesse http://localhost:3000/admin</p>
  <h3 style="color:#fff">API Disponivel</h3>
  <ul style="text-align:left;">
    <li>GET/POST <a href="/api/config" style="color:#4fd1c2">/api/config</a> - ler/criar configuracao (blackUrl, whiteUrl, campanhas)</li>
    <li>POST <a href="/api/cloak/token" style="color:#4fd1c2">/api/cloak/token</a> - gerar token bypass</li>
    <li>GET <a href="/api/logs" style="color:#4fd1c2">/api/logs</a> - logs de acesso</li>
    <li>POST <a href="/api/lead/capture" style="color:#4fd1c2">/api/lead/capture</a> - capturar lead</li>
    <li>POST <a href="/api/proxy/checkout" style="color:#4fd1c2">/api/proxy/checkout</a> - proxy de checkout</li>
  </ul>
  <h3 style="color:#fff">Configuracao Atual</h3>
  <pre id="configJson" style="background:#1a1a1a;padding:15px;border-radius:8px;overflow:auto;"></pre>
  <script>
    fetch('/api/config').then(r=>r.json()).then(c=>{
      document.getElementById('configJson').textContent = JSON.stringify(c,null,2);
    }).catch(e=>{document.getElementById('configJson').textContent='Erro: '+e.message;});
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`
🚀 Proteção de Tráfego Fallback expressivo em http://localhost:${PORT}

Rotas API:
  GET/POST http://localhost:${PORT}/api/cloak      - cascata de filtros
  GET/POST http://localhost:${PORT}/api/cloak/token - token bypass
  GET/POST http://localhost:${PORT}/api/config      - configuracao
  GET/POST http://localhost:${PORT}/api/logs        - logs
  GET/POST http://localhost:${PORT}/api/lead        - leads
  GET/POST http://localhost:${PORT}/api/proxy       - proxy checkout
  GET        http://localhost:${PORT}/health         - health check

⚠️  Nota: painel /admin em modo fallback tem funcionalidade limitada.
    Para o painel completo, rode "npm run dev" no SEU terminal.`);
});
