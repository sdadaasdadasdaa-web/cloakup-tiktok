'use client';

import Link from 'next/link';

// language: JavaScript, file: app/page.js, target: Next.js 14, Vercel
// *Página inicial estilo "Proteção de Tráfego": "Como funciona" em 3 etapas + filtros principais
//  Esta página mostra ao usuário o processo de configuração do sistema de proteção.

export default function Home() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 100%)', minHeight: '100vh', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <nav style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a2a' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4fd1c2', textDecoration: 'none' }}>Proteção de Tráfego</Link>
        <Link href="/admin" style={{ background: '#4fd1c2', color: '#0a0a0a', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', textDecoration: 'none' }}>
          Acessar Painel
        </Link>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <section style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '16px', lineHeight: 1.1 }}>
            Proteja Sua Oferta dos Bots e de Bots de Análise
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '32px', maxWidth: '600px', margin: '0 auto' }}>
            Filtro de tráfego inteligente. Apenas 2 destinos possíveis: SITE BLACK (oferta real para mobile) e SITE WHITE (disfarce para bots e desktop).
          </p>
          <Link href="/admin" style={{ background: '#4fd1c2', color: '#0a0a0a', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>
            Começar Agora — É Grátis
          </Link>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '16px' }}>
            🔒 Configuração completa em menos de 5 minutos
          </p>
        </section>

        {/* ETAPAS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Como Funciona — 3 Etapas Simples</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #2a2a2a', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#4fd1c2', color: '#0a0a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 20px' }}>1</div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#fff' }}>Adicione seu domínio</h3>
              <p style={{ color: '#888', lineHeight: 1.6 }}>
                Conecte seu site de forma rápida e fácil. Defina seu SITE BLACK (oferta real) e seu SITE WHITE (disfarce).
              </p>
            </div>
            <div style={{ background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #2a2a2a', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#4fd1c2', color: '#0a0a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 20px' }}>2</div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#fff' }}>Crie sua campanha</h3>
              <p style={{ color: '#888', lineHeight: 1.6 }}>
                Configure suas campanhas de marketing com filtros personalizados para proteger seu tráfego: bots, proxies, espionagem, geolocalização e mais.
              </p>
            </div>
            <div style={{ background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #2a2a2a', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#4fd1c2', color: '#0a0a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 20px' }}>3</div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#fff' }}>Anuncie com link customizado</h3>
              <p style={{ color: '#888', lineHeight: 1.6 }}>
                Use nossos links customizados para direcionar apenas o tráfego desejado para seu site. Cada clique é analisado antes de chegar na sua oferta.
              </p>
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Principais Filtros para o Seu Site</h2>
          <p style={{ color: '#888', textAlign: 'center', marginBottom: '32px' }}>
            Configure de forma rápida e fácil os filtros que você precisa para proteger seu site de tráfego indesejado.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {filters.map((f, i) => (
              <div key={i} style={{ background: '#141414', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a2a', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{f.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARAÇÃO */}
        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Quem Entra e Quem Sai</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#141414', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', background: '#1a1a1a', color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>O que chega</th>
                  <th style={{ padding: '16px', background: '#1a1a1a', color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>Vai pra OFERTA (BLACK)</th>
                  <th style={{ padding: '16px', background: '#1a1a1a', color: '#888', textAlign: 'left', borderBottom: '1px solid #333' }}>Vai pra DISFARCE (WHITE)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} style={{ background: row.color }}>
                    <td style={{ padding: '16px', borderBottom: '1px solid #333' }}>{row.what}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #333' }}>{row.black}</td>
                    <td style={{ padding: '16px', borderBottom: '1px solid #333' }}>{row.white}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section style={{ marginTop: '60px', background: '#141414', padding: '40px', borderRadius: '16px', border: '1px solid #2a2a2a' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' }}>Proteção Comprovada</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4fd1c2' }}>+99%</div>
              <div style={{ color: '#888' }}>Redução de bots nos anúncios</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4fd1c2' }}>0</div>
              <div style={{ color: '#888' }}>Contas banidas por tráfego fake</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4fd1c2' }}>3s</div>
              <div style={{ color: '#888' }}>Atualização dos logs em tempo real</div>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ textAlign: 'center', color: '#666', padding: '32px', borderTop: '1px solid #2a2a2a', marginTop: '60px' }}>
        <p>© 2026 Proteção de Tráfego — Redirecionamento Inteligente</p>
        <p style={{ fontSize: '0.9rem' }}>Inspirado nas melhores práticas do mercado</p>
      </footer>
    </div>
  );
}

const filters = [
  { icon: '🤖', name: 'Bots', desc: 'Bloqueia bots do TikTok, Google, Facebook, crawlers, scanners e headless browsers' },
  { icon: '🌐', name: 'Proxy/VPN', desc: 'Detecta e bloqueia tráfego de datacenters, VPNs e proxies anônimos' },
  { icon: '👁️', name: 'AdSpy', desc: 'Impede que apps de espionagem de anúncios monitorem suas campanhas' },
  { icon: '🌍', name: 'Geolocalização', desc: 'Permite ou bloqueia acessos baseados no país do visitante' },
  { icon: '📱', name: 'Dispositivos', desc: 'Aceita só celulares reais, bloqueia desktops e emuladores' },
  { icon: '🔗', name: 'Referência', desc: 'Valida se o tráfego veio de tiktok.com (referer)' },
  { icon: '🔖', name: 'Parâmetros URL', desc: 'Exige utm_source, utm_campaign, utm_medium, utm_content completos' },
  { icon: '🌐', name: 'Idioma', desc: 'Filtra por Accept-Language (ex: só pt-BR)' },
  { icon: '👤', name: 'User Agent', desc: 'Bloqueia UAs específicos ou padrões customizados' },
  { icon: '🏢', name: 'ISP', desc: 'Bloqueia provedores de datacenter (AWS, Azure, Google Cloud)' },
  { icon: '🔐', name: 'Whitelist/Blacklist', desc: 'Sua própria lista de IPs para permitir ou bloquear' },
];

const comparisonRows = [
  { what: 'Celular real (iPhone/Android)', black: <span style={{ color: '#4fd1c2', fontWeight: 'bold' }}>✅ LIBERADO</span>, white: '❌', color: 'rgba(79,209,194,0.1)' },
  { what: 'PC / Notebook / Mac', black: '❌', white: <span style={{ color: '#e84118', fontWeight: 'bold' }}>🚫 BLOQUEADO</span>, color: 'rgba(232,65,24,0.1)' },
  { what: 'Mobile + params TikTok completos', black: <span style={{ color: '#4fd1c2', fontWeight: 'bold' }}>✅ LIBERADO</span>, white: '❌', color: 'rgba(79,209,194,0.1)' },
  { what: 'Mobile sem params', black: '❌', white: <span style={{ color: '#e84118', fontWeight: 'bold' }}>🚫 DISFARCE</span>, color: 'rgba(232,65,24,0.1)' },
  { what: 'Bots TikTok / ByteDance / Google', black: '❌', white: <span style={{ color: '#e84118', fontWeight: 'bold' }}>🚫 BLOQUEADO (403)</span>, color: 'rgba(232,65,24,0.1)' },
  { what: 'Proxies / VPN / Datacenter', black: '❌', white: <span style={{ color: '#e84118', fontWeight: 'bold' }}>🚫 BLOQUEADO</span>, color: 'rgba(232,65,24,0.1)' },
  { what: 'AdSpy / espionagem', black: '❌', white: <span style={{ color: '#e84118', fontWeight: 'bold' }}>🚫 BLOQUEADO</span>, color: 'rgba(232,65,24,0.1)' },
  { what: 'Emuladores (BlueStacks, etc.)', black: '❌', white: <span style={{ color: '#e84118', fontWeight: 'bold' }}>🚫 BLOQUEADO</span>, color: 'rgba(232,65,24,0.1)' },
  { what: 'IP whitelist', black: <span style={{ color: '#4fd1c2', fontWeight: 'bold' }}>✅ LIBERADO</span>, white: '❌', color: 'rgba(79,209,194,0.1)' },
  { what: 'Token bypass (?bypass=xyz)', black: <span style={{ color: '#4fd1c2', fontWeight: 'bold' }}>✅ LIBERADO</span>, white: '❌', color: 'rgba(79,209,194,0.1)' },
];
