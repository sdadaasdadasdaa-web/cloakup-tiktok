// language: JavaScript, file: app/admin/page.js, target: Next.js 14, Vercel
// *Painel de administração do cloaker — configuração em tempo real.
//  Tudo que você muda aqui vai direto pros arquivos e a edge function aplica na próxima requisição.

'use client';

import { useState, useEffect } from 'react';

const CONFIG_PATH = '/api/config/save';

export default function AdminPage() {
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config/read');
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.error('Erro ao carregar config:', e);
    }
    setLoading(false);
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.slice(0, 50));
    } catch (e) {
      console.error('Erro ao carregar logs:', e);
    }
  };

  useEffect(() => {
    loadConfig();
    loadLogs();
    const interval = setInterval(() => loadLogs(), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (field, value) => {
    try {
      const newConfig = { ...config, [field]: value };
      await fetch(CONFIG_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      setConfig(newConfig);
      setMessage('Configuração salva com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Erro ao salvar: ' + e.message);
    }
  };

  const addUA = () => {
    handleSave('customBlockedUAs', [...(config?.customBlockedUAs || []), 'novo-bot']);
  };

  const removeUA = (idx) => {
    const arr = config?.customBlockedUAs || [];
    handleSave('customBlockedUAs', arr.filter((_, i) => i !== idx));
  };

  const addIP = () => {
    handleSave('whitelistedIPs', [...(config?.whitelistedIPs || []), '0.0.0.0']);
  };

  const removeIP = (idx) => {
    const arr = config?.whitelistedIPs || [];
    handleSave('whitelistedIPs', arr.filter((_, i) => i !== idx));
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Carregando painel...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#0f0f0f', minHeight: '100vh', color: '#fff' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Painel do Cloaker</h1>
        <p style={{ color: '#888', margin: '4px 0 0' }}>Importa China — controle de acesso por dispositivo e origem</p>
      </header>

      {message && <div style={{ background: '#1a7a36', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{message}</div>}

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Modo de Operação</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label>
            <input
              type="radio"
              name="mode"
              checked={config?.mode === 'moderate'}
              onChange={() => handleSave('mode', 'moderate')}
            />
            {' '}Modere — mobile sem params vai pra landing de captura
          </label>
          <label style={{ marginLeft: '16px' }}>
            <input
              type="radio"
              name="mode"
              checked={config?.mode === 'strict'}
              onChange={() => handleSave('mode', 'strict')}
            />
            {' '}Strict — só entra quem tem todos os params do anúncio
          </label>
        </div>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
          No modo moderate, quem chega de celular sem UTM completo vai pra uma página de captura de e-mail (lead gen). No strict, é bloqueado.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Bots Bloqueados (User-Agent)</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '12px' }}>
          Bots conhecidos do TikTok, Google, SEMrush e ferramentas de varredura já vêm bloqueados por padrão. Adicione outros abaixo:
        </p>
        {config?.customBlockedUAs?.map((ua, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <code style={{ flex: 1, background: '#1a1a1a', padding: '8px', borderRadius: '4px', wordBreak: 'break-all' }}>{ua}</code>
            <button onClick={() => removeUA(idx)} style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>X</button>
          </div>
        ))}
        <button onClick={addUA} style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}>+ Adicionar UA</button>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Botões de Teste</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '12px' }}>
          Use pra testar os diferentes cenários antes de subir os anúncios:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="/api/cloak/?utm_source=tiktok&utm_campaign=teste&utm_medium=cpc&utm_content=anuncio1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#1a7a36', color: '#fff', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Testar lead válido (desktop)
          </a>
          <button
            onClick={() => {
              const w = window.open('about:blank', '_blank');
              w.document.head.insertAdjacentHTML('beforeend', '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script>Object.defineProperty(navigator, \'userAgent\', {value: \'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1\', writable: true})<\\/script>');
              w.document.body.innerHTML = '<a href="/api/cloak/?utm_source=tiktok&utm_campaign=teste&utm_medium=cpc&utm_content=anuncio1">Click to test</a>';
            }}
            style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Simular iPhone 15 + lead TikTok
          </button>
          <button
            onClick={() => {
              const w = window.open('about:blank', '_blank');
              w.document.head.insertAdjacentHTML('beforeend', '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script>Object.defineProperty(navigator, \'userAgent\', {value: \'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36\', writable: true})<\\/script>');
              w.document.body.innerHTML = '<a href="/api/cloak/?utm_source=tiktok&utm_campaign=teste">Click to test</a>';
            }}
            style={{ background: '#8e44ad', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Simular Samsung + UTM incompleto (landing)
          </button>
          <button
            onClick={() => {
              const w = window.open('about:blank', '_blank');
              w.document.head.insertAdjacentHTML('beforeend', '<script>Object.defineProperty(navigator, \'userAgent\', {value: \'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\', writable: true})<\\/script>');
              w.document.body.innerHTML = '<a href="/api/cloak/?utm_source=tiktok&utm_campaign=teste&utm_medium=cpc&utm_content=anuncio1">Click to test desktop</a>';
            }}
            style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Simular Desktop (deve bloquear)
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>IPs Whitelist</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '12px' }}>
          IPs aqui passam direto (use pro seu escritório, ferramentas de teste ou monitoramento):
        </p>
        {config?.whitelistedIPs?.map((ip, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <code style={{ flex: 1, background: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>{ip}</code>
            <button onClick={() => removeIP(idx)} style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>X</button>
          </div>
        ))}
        <button onClick={addIP} style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}>+ Adicionar IP</button>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Parâmetros Obrigatórios do TikTok</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '12px' }}>
          A lista abaixo é pré-configurada com os parâmetros que o TikTok envia nos seus anúncios:
        </p>
        <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#4cd137' }}>
          utm_source=tiktok<br/>
          utm_campaign=...<br/>
          utm_medium=...<br/>
          utm_content=...
        </div>
        <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px' }}>
          Seu link de anúncio deve vir nesse formato. Se faltar algum campo, o usuário vai pra landing de captura (modo moderate).
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Teste Rápido</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="/api/cloak/?utm_source=tiktok&utm_campaign=teste&utm_medium=cpc&utm_content=anuncio1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#1a7a36', color: '#fff', padding: '10px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Testar lead válido (mobile simulado)
          </a>
          <button
            onClick={() => {
              const w = window.open('about:blank', '_blank');
              w.document.body.innerHTML = `<script>document.write('<a href="/api/cloak/?utm_source=tiktok&utm_campaign=teste&utm_medium=cpc&utm_content=anuncio1">Click to test</a><script>');<\/script>`;
            }}
            style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Simular UA de iPhone 15
          </button>
          <button
            onClick={() => {
              const w = window.open('about:blank', '_blank');
              w.document.body.innerHTML = `<script>document.write('<a href="/api/cloak/">Click to test</a><script>');<\/script>`;
              w.document.head.insertAdjacentHTML('beforeend', `<meta name="viewport" content="width=device-width, initial-scale=1.0"><script>Object.defineProperty(navigator, 'userAgent', {value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', writable: true})<\/script>`);
            }}
            style={{ background: '#2980b9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Simular lead do TikTok (UA iPhone)
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Logs de Acesso (últimos 50)</h2>
        <div style={{ background: '#1a1a1a', borderRadius: '6px', maxHeight: '300px', overflowY: 'auto', fontSize: '0.85rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#222' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Decisão</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>IP</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Platform</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Params OK</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '6px 8px', color: log.decision === 'ALLOWED' ? '#4cd137' : log.decision?.includes('BLOCK') ? '#e84118' : '#f39c12', fontWeight: 600 }}>{log.decision}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#ccc' }}>{log.ip}</td>
                  <td style={{ padding: '6px 8px', color: '#ccc' }}>{log.platform}</td>
                  <td style={{ padding: '6px 8px', color: '#ccc' }}>{log.paramsOk ? 'SIM' : 'NÃO'}</td>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #333', color: '#666', fontSize: '0.85rem', textAlign: 'center' }}>
        <p>Cloaker v1.0.0 — Importa China. Toda entrada é registrada.</p>
      </footer>
    </div>
  );
}
