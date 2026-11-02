'use client';

import { useState, useEffect } from 'react';

const CONFIG_PATH = '/api/cloak/config';
const SAVE_PATH = '/api/cloak/config';

const DEFAULT_CONFIG = {
  campaigns: [],
  blackUrl: '',
  decoyUrl: 'https://www.tiktok.com',
  brandName: 'Painel do Cloaker',
  brandSlogan: 'Genérico — funciona para qualquer oferta',
};

export default function AdminPage() {
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCampaign, setFilterCampaign] = useState('');

  const [form, setForm] = useState({
    name: '',
    campaignId: '',
    blackUrl: '',
    whiteUrl: '',
  });

  useEffect(() => {
    loadConfig();
    loadLogs();
    const interval = setInterval(() => { loadLogs(); }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${CONFIG_PATH}?_t=${Date.now()}`);
      const data = await res.json();
      const campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
      setConfig(data);
      setCampaigns(campaigns);
    } catch (e) {
      console.error('Erro ao carregar config:', e);
      setConfig(DEFAULT_CONFIG);
      setCampaigns([]);
    }
    setLoading(false);
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`/api/logs?_t=${Date.now()}`);
      const data = await res.json();
      setLogs(data.slice(0, 100));
    } catch (e) {
      console.error('Erro ao carregar logs:', e);
    }
  };

  const generateCampaignId = () => {
    return 'cam_' + Math.random().toString(36).substr(2, 6);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!form.blackUrl) {
      setMessage('Preencha o SITE BLACK');
      return;
    }
    if (!form.campaignId) {
      setForm({ ...form, campaignId: generateCampaignId() });
    }
    try {
      const newCampaigns = [...(config?.campaigns || []), { ...form, createdAt: Date.now() }];
      const newConfig = { ...config, campaigns: newCampaigns };
      // tambem atualiza black/white globais pro comportamento padrão do cloaker
      if (!config?.blackUrl) newConfig.blackUrl = form.blackUrl;
      if (!config?.decoyUrl) newConfig.decoyUrl = form.whiteUrl || 'https://www.tiktok.com';
      await fetch(`${SAVE_PATH}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      setConfig(newConfig);
      setCampaigns(newCampaigns);
      const link = getTiktokLink({ ...form, blackUrl: form.blackUrl || 'http://localhost:3000' });
      try {
        await navigator.clipboard.writeText(link);
        setMessage('Criada! Link copiado para a area de transferencia: ' + form.campaignId);
      } catch {
        setMessage('Criada! Campanha: ' + form.campaignId + ' (copie o link abaixo)');
      }
      setForm({ name: '', campaignId: '', blackUrl: '', whiteUrl: '' });
      setShowForm(false);
    } catch (e) {
      setMessage('Erro: ' + e.message);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Excluir esta campanha?')) return;
    try {
      const newCampaigns = (config?.campaigns || []).filter(c => c.campaignId !== id);
      const newConfig = { ...config, campaigns: newCampaigns };
      await fetch(`${SAVE_PATH}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      setConfig(newConfig);
      setCampaigns(newCampaigns);
      setMessage('Campanha excluida');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('Erro: ' + e.message);
    }
  };

  const getCampaign = (id) => campaigns.find(c => c.campaignId === id);

  const getTiktokLink = (campaign) => {
    const baseUrl = campaign.blackUrl || 'http://localhost:3000';
    const params = new URLSearchParams({
      utm_source: 'tiktok',
      utm_campaign: campaign.campaignId,
      utm_medium: 'cpc',
      utm_content: 'anti',
      campaign_id: campaign.campaignId,
    });
    return baseUrl.split('?')[0] + '?' + params.toString();
  };

  const copyLink = async (campaign) => {
    const link = getTiktokLink(campaign);
    try {
      await navigator.clipboard.writeText(link);
      setMessage('Link copiado para a area de transferencia: ' + campaign.campaignId);
    } catch {
      setMessage('Copie manualmente: ' + link);
    }
  };

  const stats = {
    allowed: logs.filter(l => l.decision === 'ALLOWED').length,
    decoy: logs.filter(l => l.decision === 'DECOY' || l.decision === 'DESKTOP_BLOCKED').length,
    blocked: logs.filter(l => l.decision?.includes('BOT_BLOCKED')).length,
  };

  const filteredLogs = filterCampaign
    ? logs.filter(l => (l.campaign_id === filterCampaign))
    : logs;

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Carregando...</div>;
  }

  const campStyle = { background: '#14291d', padding: '20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #1f4d3a' };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#0f0f0f', minHeight: '100vh', color: '#fff' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{config?.brandName || 'Painel do Cloaker'}</h1>
        <p style={{ color: '#888', margin: '4px 0 0' }}>{config?.brandSlogan || 'Genérico — funciona para qualquer oferta'}</p>
      </header>

      {message && <div style={{ background: '#1a7a36', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{message}</div>}

      {/* BLOCO: CAMPAÑHAS */}
      <section style={campStyle}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#4cd137' }}>
          1. Campanhas — gere o link do TikTok Ads
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '12px' }}>
          Cada campanha é uma oferta. Crie uma, copie o link e suba no TikTok Ads. Cada acesso chega marcado com o codificador da campanha.
        </p>

        {!showForm ? (
          <button
            onClick={() => {
              setForm({ name: '', campaignId: '', blackUrl: '', whiteUrl: '' });
              setShowForm(true);
            }}
            style={{ background: '#4cd137', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Nova Campanha
          </button>
        ) : (
          <form onSubmit={handleCreateCampaign} style={{ background: '#0a0a0a', padding: '16px', borderRadius: '8px', border: '1px solid #444' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#fff' }}>Nova campanha</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Nome da oferta</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Oferta Black Friday, Produto X"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Codificador (gerado)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={form.campaignId || ''}
                    onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                    placeholder="cam_x9k2p (gerar automatico)"
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#4cd137', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, campaignId: generateCampaignId() })}
                    style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '0 14px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Gerar
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>SITE BLACK (oferta - pra onde vai quem e legit)</label>
                <input
                  type="text"
                  value={form.blackUrl}
                  onChange={(e) => setForm({ ...form, blackUrl: e.target.value })}
                  placeholder="https://seu-site-de-vendas.com/oferta"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>SITE WHITE (disfarce - pra quem não passa)</label>
                <input
                  type="text"
                  value={form.whiteUrl}
                  onChange={(e) => setForm({ ...form, whiteUrl: e.target.value })}
                  placeholder="https://www.tiktok.com OU link de noticia"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#111', color: '#fff' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="submit"
                style={{ background: '#4cd137', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Criar Campanha
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {campaigns.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#ccc' }}>Campanhas ativas</h3>
            {campaigns.map((c, i) => (
              <div key={i} style={{ background: '#0a0a0a', padding: '12px', borderRadius: '6px', border: '1px solid #333', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{c.name || 'Sem nome'}</strong>
                    <span style={{ color: '#888', marginLeft: '8px', fontFamily: 'monospace' }}>{c.campaignId}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => copyLink(c)}
                      style={{ background: '#4cd137', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      COPIAR LINK
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(c.campaignId)}
                      style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#4cd137', wordBreak: 'break-all' }}>
                  {getTiktokLink(c)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BLOCO: COMO FUNCIONA */}
      <section style={{ background: '#141d29', padding: '20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #1f2e4d' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#4c8ae8' }}>
          Como usar
        </h2>
        <ol style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li>Clique em <strong>+ Nova Campanha</strong> e preencha: nome da oferta, SITE BLACK (sua venda) e SITE WHITE (disfarce).</li>
          <li>O painel gera um link pronto com os params do TikTok.</li>
          <li>Clique em <strong>COPIAR LINK</strong> e cole no TikTok Ads como destino do anúncio.</li>
          <li>Quem chegar DE CELULAR REAL com os params vai pro SITE BLACK. Quem não atender vai pro SITE WHITE.</li>
          <li>No log abaixo, filtre por campanha pra ver quantos acessos cada oferta teve.</li>
        </ol>
      </section>

      {/* ESTATS */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Resumo dos cliques (ultimas 100 entradas)</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: '#14291d', padding: '16px', borderRadius: '8px', flex: 1, border: '1px solid #1f4d3a' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Pra SITE BLACK (leads legit)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4cd137' }}>{stats.allowed}</div>
          </div>
          <div style={{ background: '#291414', padding: '16px', borderRadius: '8px', flex: 1, border: '1px solid #4d1f1f' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Pra SITE WHITE (bloqueados)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e84118' }}>{stats.decoy}</div>
          </div>
          <div style={{ background: '#141d29', padding: '16px', borderRadius: '8px', flex: 1, border: '1px solid #1f2e4d' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Bots bloqueados</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c0392b' }}>{stats.blocked}</div>
          </div>
        </div>
      </section>

      {/* LOG EM TEMPO REAL */}
      <section>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Log de acesso (tempo real)</h2>

        <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Filtrar por campanha:</span>
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#111', color: '#fff', fontSize: '0.9rem' }}
          >
            <option value="">Todas as campanhas</option>
            {campaigns.map((c) => (
              <option key={c.campaignId} value={c.campaignId}>{c.name || 'Sem nome'} ({c.campaignId})</option>
            ))}
          </select>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>{filteredLogs.length} registros</span>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto', fontSize: '0.85rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#222' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Hora</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>IP</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Dispositivo</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Campanha</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#888' }}>Decisão</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => {
                const camp = getCampaign(log.campaign_id);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '6px 8px', color: '#888' }}>{log.time || '-'}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#ccc' }}>{log.ip || '-'}</td>
                    <td style={{ padding: '6px 8px', color: '#ccc' }}>{log.platform || '-'}</td>
                    <td style={{ padding: '6px 8px' }}>
                      {camp ? (
                        <span style={{ color: '#4cd137', fontFamily: 'monospace' }}>
                          {camp.name} <span style={{ color: '#666' }}>({camp.campaignId})</span>
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>{log.campaign_id || '-'}</span>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: log.decision === 'ALLOWED' ? '#4cd137' : log.decision === 'DECOY' ? '#e84118' : log.decision?.includes('BOT_BLOCKED') ? '#c0392b' : '#f39c12' }}>
                      {log.decision}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLogs.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Sem acessos ainda.</div>}
        </div>
      </section>
    </div>
  );
}
