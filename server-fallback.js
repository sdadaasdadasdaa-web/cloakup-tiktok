#!/usr/bin/env node
// ============================================================
// SERVIDOR FALLBACK EXPRESS
// ============================================================
// Usado quando o Next.js não consegue iniciar (spawn EPERM).
// Serve:
//   - Todas as rotas API (/api/*) importando os handlers diretos
//   - Health check
//
// Nota: paginas React (/admin, /, /capture) NAO sao renderizadas.
// O ideal é rodar "npm run dev" no SEU terminal.
// ============================================================

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Importar handlers das rotas API do Next.js
const apiCloak = await import('./app/api/cloak/route.js');
const apiConfig = await import('./app/api/config/route.js');
const apiLogs = await import('./app/api/logs/route.js');
const apiLead = await import('./app/api/lead/route.js');
const apiProxy = await import('./app/api/proxy/route.js');
const apiCloakToken = await import('./app/api/cloak/token.js');

// Roteamento manual baseado nas rotas do Next.js
// /api/cloak -> rota de cloaking (qualquer metodo)
app.all('/api/cloak', (req, res, next) => {
  // Next.js App Router chama handler as GET/POST dependendo do method
  const handler = req.method === 'POST' ? apiCloak.POST : apiCloak.GET;
  handler(req).then(r => res.set(r.headers).send(r.body)).catch(next);
});

// /api/cloak/token
app.all('/api/cloak/token', (req, res, next) => {
  const handler = req.method === 'POST' ? apiCloakToken.POST : apiCloakToken.GET;
  handler(req).then(r => res.set(r.headers).send(r.body)).catch(next);
});

// /api/config
app.all('/api/config', (req, res, next) => {
  const handler = req.method === 'POST' ? apiConfig.POST : apiConfig.GET;
  handler(req).then(r => res.set(r.headers).send(r.body)).catch(next);
});

// /api/logs
app.all('/api/logs', (req, res, next) => {
  const handler = req.method === 'POST' ? apiLogs.POST : apiLogs.GET;
  handler(req).then(r => res.set(r.headers).send(r.body)).catch(next);
});

// /api/lead
app.all('/api/lead', (req, res, next) => {
  const handler = req.method === 'POST' ? apiLead.POST : apiLead.GET;
  handler(req).then(r => res.set(r.headers).send(r.body)).catch(next);
});

// /api/proxy
app.all('/api/proxy', (req, res, next) => {
  const handler = req.method === 'POST' ? apiProxy.POST : apiProxy.GET;
  handler(req).then(r => res.set(r.headers).send(r.body)).catch(next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cloakup-tiktok-ads', version: '2.0.0', mode: 'express-fallback' });
});

// Opcional: pages basicas (sem interatividade React)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>CLOAKER v2.0</title></head>
    <body style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
      <h1 style="color:#4fd1c2">CLOAKER v2.0 - Modo Fallback</h1>
      <p>O servidor Next.js não pôde iniciar (spawn EPERM). As rotas API estão disponíveis.</p>
      <p><strong>Acesse:</strong></p>
      <ul style="text-align:left;display:inline-block;">
        <li><a href="/health" style="color:#4fd1c2">/health</a> - health check</li>
        <li><a href="/api/logs" style="color:#4fd1c2">/api/logs</a> - logs de acesso</li>
        <li><a href="/api/config" style="color:#4fd1c2">/api/config</a> - configuração</li>
      </ul>
      <p style="margin-top:20px"><strong>Recomendado:</strong> Abra um terminal e rode <code>npm run dev</code> para o painel completo.</p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n🚀 CLOAKER FALLBACK servindo em http://localhost:${PORT}\n`);
  console.log(' Rotas API disponiveis:');
  console.log('   GET/POST http://localhost:' + PORT + '/api/cloak');
  console.log('   GET/POST http://localhost:' + PORT + '/api/cloak/token');
  console.log('   GET/POST http://localhost:' + PORT + '/api/config');
  console.log('   GET/POST http://localhost:' + PORT + '/api/logs');
  console.log('   GET/POST http://localhost:' + PORT + '/api/lead');
  console.log('   GET/POST http://localhost:' + PORT + '/api/proxy');
  console.log('   GET        http://localhost:' + PORT + '/health');
  console.log('\n⚠️  Nota: O painel /admin em modo fallback tem funcionalidade limitada.');
  console.log('   O ideal é rodar "npm run dev" no SEU terminal.\n');
});
