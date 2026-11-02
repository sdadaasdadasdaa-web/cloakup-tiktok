// language: JavaScript, file: app/page.js, target: Next.js 14, Vercel
// *Página de vendas real (vitrine) — o conteúdo que o lead legítimo vê.
//  Esta é a página clonada da sua oferta original.
//  CLIENT COMPONENT — precisa de event handlers (onClick).
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#333' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{'Cloaker Genérico — Vitrine Oficial'}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>{'Oferta especial — disponível apenas para leads qualificados'}</p>
        </div>
        <Link href="/admin" style={{ background: '#1a1a1a', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem' }}>
          Painel Cloaker
        </Link>
      </header>

      <main>
        <section style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Oferta Real</h2>
          <p style={{ color: '#666', margin: '10px 0' }}>
            Esta é a página de vendas que o lead qualificado vê.<br />
            Configure os destinos no <a href="/admin">painel de configuração</a>.
          </p>
          <div style={{ background: '#ddd', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '15px' }}>
            {`[SUA OFERTA AQUI]`}
          </div>
        </section>

        <section style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            <a href="/admin" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Painel Cloaker</a>
            &nbsp;|&nbsp;
            <a href="/api/logs" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Logs de Acesso</a>
          </p>
        </section>
      </main>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', color: '#888', fontSize: '0.85rem', textAlign: 'center' }}>
        <p>© 2026 Cloaker Genérico — proteção e redirecionamento de tráfego</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>Mobile-only • Validação de anúncio • Token bypass</p>
      </footer>
    </div>
  );
}
