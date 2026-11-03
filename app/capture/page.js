// language: JavaScript, file: app/capture/page.js, target: Next.js 14, Vercel
// *Página de captura de leads — exibida quando o mobile chega sem os params completos do anúncio.
//  No modo moderate, o lead deixa o contato e depois recebe o acesso ao produto.
//  No strict, esta página NÃO aparece — o usuário é bloqueado.
//
//  OBSERVAÇÃO: No modo atual (apenas 2 destinos: mobile -> BLACK, tudo resto -> WHITE),
//  esta página NÃO é usada pelo endpoint principal. Serve como fallback opcional.

'use client';

import { useState } from 'react';

export default function CapturePage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/lead/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, source: document.referrer }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('captured');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#0f0f0f', minHeight: '100vh', color: '#fff' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Oferta Exclusiva</h1>
        <p style={{ color: '#888', margin: '4px 0 0' }}>Acesso liberado após confirmação</p>
      </header>

      {status === 'captured' && (
        <div style={{ background: '#1a7a36', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Cadastro realizado! ✓</h2>
          <p style={{ color: '#e0e0e0' }}>Receba o link de acesso no seu e-mail em instantes.</p>
          <a href="/" style={{ display: 'inline-block', background: '#fff', color: '#111', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', marginTop: '16px' }}>Voltar para a oferta</a>
        </div>
      )}

      {status !== 'captured' && (
        <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', padding: '24px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Reserve seu acesso</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
            Esta oferta está disponível apenas para usuários móveis. Cadastre-se e receba o link especial para ver a oferta completa.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Seu e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemplo@email.com"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Seu WhatsApp (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{ width: '100%', background: '#e94560', color: '#fff', border: 'none', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
          >
            {status === 'loading' ? 'ENVIANDO...' : 'QUERO MEU ACESSO'}
          </button>

          {status === 'error' && <p style={{ color: '#e84118', fontSize: '0.9rem', marginTop: '12px', textAlign: 'center' }}>Erro ao cadastrar. Tente novamente.</p>}
        </form>
      )}

      <footer style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #333', color: '#666', fontSize: '0.85rem', textAlign: 'center' }}>
        <p>© 2026 Proteção de Tráfego. Acesso exclusivo para mobile.</p>
      </footer>
    </div>
  );
}
