'use client';

import { useState, useEffect } from 'react';

const CONFIG_PATH = '/api/config';
const SAVE_PATH = '/api/config';
const LOGS_PATH = '/api/logs';

// Tema CloakUp escuro
const styles = {
  page: { padding: '24px', maxWidth: '1300px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#fff' },
  header: { borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '24px' },
  title: { margin: 0, fontSize: '1.8rem', color: '#fff' },
  subtitle: { color: '#888', margin: '4px 0 0', fontSize: '1rem' },
  card: { background: '#141414', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #2a2a2a' },
  sectionTitle: { fontSize: '1.3rem', marginBottom: '16px', color: '#4fd1c2', fontWeight: 600 },
  label: { display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '6px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '0.95rem' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '0.9rem' },
  button: { background: '#4fd1c2', color: '#0a0a0a', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  secondaryButton: { background: '#333', color: '#fff', border: '1px solid #444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  dangerButton: { background: '#e84118', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' },
  success: { background: '#145a44', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  error: { background: '#5a1414', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  stepContainer: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  step: { flex: 1, minWidth: '280px', background: '#141414', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a2a', position: 'relative' },
  stepNumber: { width: '32px', height: '32px', background: '#4fd1c2', color: '#0a0a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 auto 12px' },
  switch: { display: 'flex', alignItems: 'center', gap: '10px' },
  toggle: { width: '44px', height: '24px', background: '#333', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' },
  toggleKnob: { width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', transition: 'left 0.3s' },
  checkbox: { width: '18px', height: '18px', accentColor: '#4fd1c2' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
  th: { padding: '10px', textAlign: 'left', color: '#888', borderBottom: '1px solid #333' },
  td: { padding: '10px', borderBottom: '1px solid #333', color: '#ccc' },
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
};

export default function AdminPage() {
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterCampaign, setFilterCampaign] = useState('');

  const [form, setForm] = useState({ name: '', campaignId: '', blackUrl: '', whiteUrl: '' });

  // Estados auxiliares do UI — DEVEM ficar ANTES de qualquer return condicional
  const [openSections, setOpenSections] = useState({
    bots: true, proxy: true, adspy: true, geo: true, device: true,
    referer: true, params: true, lang: true, ua: true, isp: true, whitelist: true, mode: true,
  });

  const isSectionOpen = (key) => openSections[key] ?? false;
  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    loadConfig();
    loadLogs();
    const interval = setInterval(() => loadLogs(), 3000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${CONFIG_PATH}?_t=${Date.now()}`);
      const data = await res.json();
      setConfig(data);
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
    } catch (e) {
      console.error('Erro ao carregar config:', e);
      setConfig({ ...defaultConfig() });
      setCampaigns([]);
    }
    setLoading(false);
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`${LOGS_PATH}?_t=${Date.now()}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error('Erro ao carregar logs:', e);
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      const res = await fetch(`${SAVE_PATH}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setMessage({ type: 'success', text: 'Configuração salva com sucesso!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro de conexão: ' + e.message });
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleFilter = (filter) => {
    const newConfig = { ...config };
    if (filter === 'forceMobileOnly') newConfig.forceMobileOnly = !newConfig.forceMobileOnly;
    if (filter === 'proxyEnabled') newConfig.proxyEnabled = !newConfig.proxyEnabled;
    if (filter === 'adsSpyEnabled') newConfig.adsSpyEnabled = !newConfig.adsSpyEnabled;
    if (filter === 'geoEnabled') newConfig.geoEnabled = !newConfig.geoEnabled;
    if (filter === 'refererEnabled') newConfig.refererEnabled = !newConfig.refererEnabled;
    if (filter === 'paramsEnabled') newConfig.paramsEnabled = !newConfig.paramsEnabled;
    if (filter === 'langEnabled') newConfig.langEnabled = !newConfig.langEnabled;
    if (filter === 'uaEnabled') newConfig.uaEnabled = !newConfig.uaEnabled;
    if (filter === 'ispEnabled') newConfig.ispEnabled = !newConfig.ispEnabled;
    saveConfig(newConfig);
  };

  const updateFilter = (filter, value) => {
    const newConfig = { ...config };
    if (filter === 'allowedCountries') newConfig.geoSettings.allowedCountries = value.split(',').map(s => s.trim()).filter(Boolean);
    if (filter === 'blockedCountries') newConfig.geoSettings.blockedCountries = value.split(',').map(s => s.trim()).filter(Boolean);
    if (filter === 'allowedLanguages') newConfig.allowedLanguages = value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (filter === 'whitelistIPs') newConfig.whitelistIPs = value.split(',').map(s => s.trim()).filter(Boolean);
    if (filter === 'blacklistIPs') newConfig.blacklistIPs = value.split(',').map(s => s.trim()).filter(Boolean);
    if (filter === 'customBlockedUAs') newConfig.customBlockedUAs = value.split(',').map(s => s.trim()).filter(Boolean);
    if (filter === 'blackUrl') newConfig.blackUrl = value;
    if (filter === 'whiteUrl') newConfig.whiteUrl = value;
    if (filter === 'decoyUrl') newConfig.decoyUrl = value;
    if (filter === 'mode') newConfig.mode = value;
    saveConfig(newConfig);
  };

  const generateCampaignId = () => 'cam_' + Math.random().toString(36).substr(2, 7);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!form.blackUrl) {
      setMessage({ type: 'error', text: 'Preencha o SITE BLACK' });
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!form.campaignId) setForm({ ...form, campaignId: generateCampaignId() });
    try {
      const newCampaigns = [...(config?.campaigns || []), { ...form, createdAt: Date.now() }];
      const newConfig = { ...config, campaigns: newCampaigns };
      if (!config?.blackUrl) newConfig.blackUrl = form.blackUrl;
      if (!config?.decoyUrl) newConfig.decoyUrl = form.whiteUrl || 'https://www.tiktok.com';
      const res = await fetch(`${SAVE_PATH}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setCampaigns(newCampaigns);
        const link = getTiktokLink({ ...form, blackUrl: form.blackUrl });
        try {
          await navigator.clipboard.writeText(link);
          setMessage({ type: 'success', text: 'Criada! Link copiado: ' + form.campaignId });
        } catch {
          setMessage({ type: 'success', text: 'Criada! Campanha: ' + form.campaignId + ' (copie o link) ' });
        }
        setForm({ name: '', campaignId: '', blackUrl: '', whiteUrl: '' });
        setShowForm(false);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro: ' + e.message });
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Excluir esta campanha?')) return;
    try {
      const newCampaigns = (config?.campaigns || []).filter(c => c.campaignId !== id);
      await fetch(`${SAVE_PATH}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, campaigns: newCampaigns }),
      });
      setConfig({ ...config, campaigns: newCampaigns });
      setCampaigns(newCampaigns);
      setMessage({ type: 'success', text: 'Campanha excluída' });
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro: ' + e.message });
    }
  };

  const getCampaign = (id) => campaigns.find(c => c.campaignId === id);

  const getTiktokLink = (campaign) => {
    const baseUrl = 'https://' + window.location.host;
    const params = new URLSearchParams({
      utm_source: 'tiktok',
      utm_campaign: campaign.campaignId,
      utm_medium: 'cpc',
      utm_content: 'anti',
      campaign_id: campaign.campaignId,
    });
    return baseUrl + '/api/cloak?' + params.toString();
  };

  const copyLink = async (campaign) => {
    const link = getTiktokLink(campaign);
    try {
      await navigator.clipboard.writeText(link);
      setMessage({ type: 'success', text: 'Link copiado: ' + campaign.campaignId });
    } catch {
      setMessage({ type: 'success', text: 'Copie manualmente: ' + link });
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const generateBypassToken = async () => {
    try {
      const res = await fetch('/api/config/token', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const link = 'https://' + window.location.host + '/api/cloak?bypass=' + data.token;
        await navigator.clipboard.writeText(link);
        setMessage({ type: 'success', text: 'Token gerado e copiado! Use: ' + link });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao gerar token: ' + e.message });
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const defaultConfig = () => ({
    brandName: 'CLOAKUP',
    brandSlogan: 'Proteção de tráfego de alto nível para TikTok Ads',
    mode: 'moderate',
    blackUrl: 'https://importa-chiina.vercel.app/',
    whiteUrl: 'https://www.tiktok.com',
    decoyUrl: 'https://www.tiktok.com',
    whitelistEnabled: true, whitelistIPs: [],
    blacklistEnabled: false, blacklistIPs: [],
    strictTiktokBots: ['TikTok Advertising', 'TikTok Ads Manager', 'TikTok Pixel', 'tiktok-tracker', 'omnilabs', 'bytedance', 'ByteDance'],
    blockSearchBots: true,
    customBlockedUAs: [],
    blockEmulators: true,
    proxyEnabled: true,
    adsSpyEnabled: true,
    geoEnabled: true,
    geoSettings: { allowedCountries: [], blockedCountries: [] },
    forceMobileOnly: true,
    refererEnabled: true,
    paramsEnabled: true,
    langEnabled: false,
    allowedLanguages: [],
    uaEnabled: false,
    uaPatterns: [],
    ispEnabled: false,
    bypassParam: 'bypass',
    campaigns: [],
  });

  const stats = {
    allowed: logs.filter(l => l.decision === 'ALLOWED').length,
    decoy: logs.filter(l => ['DECOY', 'DESKTOP_BLOCKED', 'REFERER_INVALID', 'PARAMS_MISSING'].includes(l.decision)).length,
    blocked: logs.filter(l => l.decision === 'BLOCKED').length,
  };

  const filteredLogs = filterCampaign ? logs.filter(l => l.campaign_id === filterCampaign) : logs;

  if (loading) {
    return <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }

  const FilterSection = ({ title, children, isOpen, onToggle }) => (
    <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{ background: '#1a1a1a', padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={onToggle}>
        <span style={{ fontWeight: 600, color: '#fff' }}>{title}</span>
        <span style={{ color: '#888' }}>{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && <div style={{ padding: '16px', borderTop: '1px solid #333' }}>{children}</div>}
    </div>
  );

  const Toggle = ({ checked, onChange, label }) => (
    <div style={styles.switch}>
      <div style={{ ...styles.toggle, background: checked ? '#4fd1c2' : '#333' }} onClick={onChange}>
        <div style={{ ...styles.toggleKnob, left: checked ? '22px' : '2px' }} />
      </div>
      {label && <span style={{ fontSize: '0.9rem', color: '#ccc' }}>{label}</span>}
    </div>
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>{config?.brandName || 'CLOAKUP'}</h1>
        <p style={styles.subtitle}>{config?.brandSlogan || 'Proteção de tráfego de alto nível para TikTok Ads'}</p>
      </header>

      {message && (
        <div style={{ ...styles.success, opacity: message.type === 'error' ? 0.9 : 1 }}>
          {message.text}
        </div>
      )}

      {/* ================= ETAPA 1: OFERTA ================= */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>1️⃣ Adicione sua Oferta</h2>
        <p style={{ color: '#888', marginBottom: '16px' }}>Defina onde o tráfego legítimo vai e para onde os bloqueados serão desviados.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={styles.label}>SITE BLACK (oferta real)</label>
            <input
              type="text"
              value={config?.blackUrl || ''}
              onChange={(e) => updateFilter('blackUrl', e.target.value)}
              placeholder="https://importa-chiina.vercel.app/"
              style={styles.input}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Para onde vai mobile + params do TikTok</small>
          </div>
          <div>
            <label style={styles.label}>SITE WHITE (disfarce)</label>
            <input
              type="text"
              value={config?.whiteUrl || ''}
              onChange={(e) => updateFilter('whiteUrl', e.target.value)}
              placeholder="https://www.mundo-surf.com/pt/news/..."
              style={styles.input}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Para onde vão bots/PC (parece normal)</small>
          </div>
        </div>
      </section>

      {/* ================= ETAPA 2: CAMPAÑHA ================= */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>2️⃣ Crie Sua Campanha</h2>
        <p style={{ color: '#888', marginBottom: '16px' }}>Cada campanha é uma oferta. Gere o link customizado e suba no TikTok Ads.</p>

        {!showForm ? (
          <button style={styles.button} onClick={() => setShowForm(true)}>+ Nova Campanha</button>
        ) : (
          <form onSubmit={handleCreateCampaign} style={{ background: '#141414', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#fff' }}>Nova campanha</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={styles.label}>Nome da oferta</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Prancha Elétrica Black Friday" required style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Codificador (campaign_id)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={form.campaignId || ''} onChange={(e) => setForm({ ...form, campaignId: e.target.value })} placeholder="cam_x9k2p (gerar automático)" style={{ ...styles.input, flex: 1 }} />
                  <button type="button" onClick={() => setForm({ ...form, campaignId: generateCampaignId() })} style={styles.secondaryButton}>Gerar</button>
                </div>
              </div>
              <div>
                <label style={styles.label}>SITE BLACK</label>
                <input type="text" value={form.blackUrl} onChange={(e) => setForm({ ...form, blackUrl: e.target.value })} placeholder="https://seu-site.vercel.app/" required style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>SITE WHITE</label>
                <input type="text" value={form.whiteUrl} onChange={(e) => setForm({ ...form, whiteUrl: e.target.value })} placeholder="https://www.tiktok.com" style={styles.input} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="submit" style={styles.button}>Criar Campanha</button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.secondaryButton}>Cancelar</button>
            </div>
          </form>
        )}

        {campaigns.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#ccc' }}>Campanhas ativas</h3>
            {campaigns.map((c) => (
              <div key={c.campaignId} style={{ background: '#141414', padding: '12px', borderRadius: '8px', border: '1px solid #333', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{c.name || 'Sem nome'}</strong>
                    <span style={{ color: '#888', marginLeft: '8px', fontFamily: 'monospace' }}>{c.campaignId}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => copyLink(c)} style={{ ...styles.button, padding: '8px 14px', fontSize: '0.9rem' }}>COPIAR LINK</button>
                    <button onClick={() => handleDeleteCampaign(c.campaignId)} style={styles.dangerButton}>Excluir</button>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#4fd1c2', wordBreak: 'break-all' }}>
                  {getTiktokLink(c)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= FILTROS ================= */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>3️⃣ Filtros de Proteção</h2>
        <p style={{ color: '#888', marginBottom: '16px' }}>Configure cada camada de proteção. Mobile-only + bots + params são o padrão seguro.</p>

        <FilterSection title="🤖 Bots & Crawlers" isOpen={isSectionOpen('bots')} onToggle={() => toggleSection('bots')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.blockEmulators} onChange={() => {}} label="Bloquear emuladores (BlueStacks, Genymotion)" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.blockSearchBots} onChange={() => {}} label="Bloquear bots de busca (Googlebot, Bingbot)" />
          </div>
          <div>
            <label style={styles.label}>Bots TikTok/ByteDance (sempre bloqueados)</label>
            <input type="text" value={(config?.strictTiktokBots || []).join(', ')} onChange={(e) => updateFilter('customBlockedUAs', e.target.value)} style={styles.input} />
          </div>
        </FilterSection>

        <FilterSection title="🌐 Proxy/VPN & Datacenter" isOpen={isSectionOpen('proxy')} onToggle={() => toggleSection('proxy')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.proxyEnabled} onChange={() => toggleFilter('proxyEnabled')} label="Ativar filtro" />
          </div>
          <small style={{ color: '#666' }}>Bloqueia IPs de datacenter, cloud, VPN e proxies anônimos</small>
        </FilterSection>

        <FilterSection title="👁️ AdSpy & Espionagem" isOpen={isSectionOpen('adspy')} onToggle={() => toggleSection('adspy')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.adsSpyEnabled} onChange={() => toggleFilter('adsSpyEnabled')} label="Ativar filtro" />
          </div>
          <small style={{ color: '#666' }}>Bloqueia AdSpy, AdMonitor, SocialBlade, Exolyt e similares</small>
        </FilterSection>

        <FilterSection title="🌍 Geolocalização" isOpen={isSectionOpen('geo')} onToggle={() => toggleSection('geo')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.geoEnabled} onChange={() => toggleFilter('geoEnabled')} label="Ativar filtro" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.label}>Países permitidos (deixe vazio = todos)</label>
              <input type="text" value={config?.geoSettings?.allowedCountries?.join(', ') || ''} onChange={(e) => updateFilter('allowedCountries', e.target.value)} placeholder="BR, US, PT" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Países bloqueados</label>
              <input type="text" value={config?.geoSettings?.blockedCountries?.join(', ') || ''} onChange={(e) => updateFilter('blockedCountries', e.target.value)} placeholder="CN, RU, KP" style={styles.input} />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="📱 Dispositivos" isOpen={isSectionOpen('device')} onToggle={() => toggleSection('device')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.forceMobileOnly} onChange={() => toggleFilter('forceMobileOnly')} label="Mobile-only (só iPhone/Android entram)" />
          </div>
          <small style={{ color: '#666' }}>Desktop, tablet e emuladores são bloqueados</small>
        </FilterSection>

        <FilterSection title="🔗 Referência (Referer)" isOpen={isSectionOpen('referer')} onToggle={() => toggleSection('referer')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.refererEnabled} onChange={() => toggleFilter('refererEnabled')} label="Ativar filtro" />
          </div>
          <small style={{ color: '#666' }}>Exige tráfego vindo de tiktok.com / vm.tiktok.com</small>
        </FilterSection>

        <FilterSection title="🔖 Parâmetros de URL" isOpen={isSectionOpen('params')} onToggle={() => toggleSection('params')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.paramsEnabled} onChange={() => toggleFilter('paramsEnabled')} label="Ativar filtro" />
          </div>
          <small style={{ color: '#666' }}>Exige utm_source, utm_campaign, utm_medium, utm_content</small>
        </FilterSection>

        <FilterSection title="🌐 Idioma do Navegador" isOpen={isSectionOpen('lang')} onToggle={() => toggleSection('lang')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.langEnabled} onChange={() => toggleFilter('langEnabled')} label="Ativar filtro" />
          </div>
          <div>
            <label style={styles.label}>Idiomas permitidos (pt-BR, en-US...)</label>
            <input type="text" value={config?.allowedLanguages?.join(', ') || ''} onChange={(e) => updateFilter('allowedLanguages', e.target.value)} placeholder="pt-BR, pt-PT, en-US" style={styles.input} />
          </div>
        </FilterSection>

        <FilterSection title="👤 User Agent Customizado" isOpen={isSectionOpen('ua')} onToggle={() => toggleSection('ua')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.uaEnabled} onChange={() => toggleFilter('uaEnabled')} label="Ativar filtro" />
          </div>
          <div>
            <label style={styles.label}>Padrões de UA a bloquear (separados por vírgula)</label>
            <input type="text" value={(config?.uaPatterns || []).join(', ') || ''} onChange={(e) => updateFilter('customBlockedUAs', e.target.value)} style={styles.input} />
          </div>
        </FilterSection>

        <FilterSection title="🏢 ISP / Provedor" isOpen={isSectionOpen('isp')} onToggle={() => toggleSection('isp')}>
          <div style={{ marginBottom: '12px' }}>
            <Toggle checked={config?.ispEnabled} onChange={() => toggleFilter('ispEnabled')} label="Ativar filtro" />
          </div>
          <small style={{ color: '#666' }}>Bloqueia provedores de datacenter (AWS, Azure, Google Cloud)</small>
        </FilterSection>

        <FilterSection title="🔐 Whitelist / Blacklist de IPs" isOpen={isSectionOpen('whitelist')} onToggle={() => toggleSection('whitelist')}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={styles.label}>Whitelist - IPs que SEMPRE entram (seu escritório, teste)</label>
              <input type="text" value={(config?.whitelistIPs || []).join(', ') || ''} onChange={(e) => updateFilter('whitelistIPs', e.target.value)} placeholder="187.x.x.x, 201.x.x.x" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Blacklist - IPs que SEMPRE são bloqueados</label>
              <input type="text" value={(config?.blacklistIPs || []).join(', ') || ''} onChange={(e) => updateFilter('blacklistIPs', e.target.value)} placeholder="187.x.x.x" style={styles.input} />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="🎭 Modos de Operação" isOpen={isSectionOpen('mode')} onToggle={() => toggleSection('mode')}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.label}>Modo Moderate (padrão)</label>
              <select value="moderate" onChange={() => updateFilter('mode', 'moderate')} style={styles.select}>
                <option value="moderate">Moderate — mobile sem params vai para o disfarce</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Modo Strict</label>
              <select value="strict" onChange={() => updateFilter('mode', 'strict')} style={styles.select}>
                <option value="strict">Strict — mobile sem params é bloqueado (403)</option>
              </select>
            </div>
          </div>
        </FilterSection>
      </section>

      {/* ================= SEGURANÇA ================= */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>🔐 Segurança - Token Bypass</h2>
        <p style={{ color: '#888', marginBottom: '16px' }}>Link secreto estilo CloakUp que libera qualquer dispositivo (use só para testes ou VIPs).</p>
        <button style={styles.button} onClick={generateBypassToken}>Gerar Token Bypass</button>
        <div style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#4fd1c2', wordBreak: 'break-all' }}>
          <small>Clique em "Gerar Token Bypass" para criar um novo token seguro (JWT assinado, válido por 30 dias)</small>
        </div>
      </section>

      {/* ================= ESTATS ================= */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📊 Resumo dos Cliques (últimos {logs.length} registros)</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: '#143623', padding: '16px', borderRadius: '8px', flex: 1, border: '1px solid #2a5a40' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Pra SITE BLACK (leads legit)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4fd1c2' }}>{stats.allowed}</div>
          </div>
          <div style={{ background: '#361414', padding: '16px', borderRadius: '8px', flex: 1, border: '1px solid #5a2a2a' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Pra SITE WHITE (bloqueados)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e84118' }}>{stats.decoy}</div>
          </div>
          <div style={{ background: '#142636', padding: '16px', borderRadius: '8px', flex: 1, border: '1px solid #2a405a' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Bots bloqueados</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c0392b' }}>{stats.blocked}</div>
          </div>
        </div>
      </section>

      {/* ================= LOGS ================= */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>📜 Log de Acesso (tempo real - atualiza a cada 3s)</h2>
        <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Filtrar por campanha:</span>
          <select value={filterCampaign} onChange={(e) => setFilterCampaign(e.target.value)} style={styles.select}>
            <option value="">Todas as campanhas</option>
            {campaigns.map((c) => (
              <option key={c.campaignId} value={c.campaignId}>{c.name || 'Sem nome'} ({c.campaignId})</option>
            ))}
          </select>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>{filteredLogs.length} registros</span>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: '8px', maxHeight: '450px', overflowY: 'auto' }}>
          <table style={styles.table}>
            <thead style={{ position: 'sticky', top: 0, background: '#222' }}>
              <tr>
                <th style={styles.th}>Hora</th>
                <th style={styles.th}>IP</th>
                <th style={styles.th}>Dispositivo</th>
                <th style={styles.th}>Campanha</th>
                <th style={styles.th}>Filtros</th>
                <th style={styles.th}>Decisão</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => {
                const camp = getCampaign(log.campaign_id);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                    <td style={styles.td}>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('pt-BR') : '-'}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace' }}>{log.ip || '-'}</td>
                    <td style={styles.td}>{log.platform || '-'}</td>
                    <td style={styles.td}>
                      {camp ? (
                        <span style={{ color: '#4fd1c2', fontFamily: 'monospace' }}>{camp.name} <span style={{ color: '#666' }}>({camp.campaignId})</span></span>
                      ) : (
                        <span style={{ color: '#666' }}>{log.campaign_id || '-'}</span>
                      )}
                    </td>
                    <td style={styles.td}>{log.filters ? log.filters.join(' → ') : '-'}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      <span style={{
                        ...styles.badge,
                        color: log.decision === 'ALLOWED' ? '#4fd1c2' : log.decision === 'DECOY' ? '#e84118' : log.decision === 'BLOCKED' ? '#c0392b' : '#f39c12',
                        background: log.decision === 'ALLOWED' ? 'rgba(79,209,194,0.15)' : log.decision === 'DECOY' ? 'rgba(232,65,24,0.15)' : 'rgba(192,57,43,0.15)'
                      }}>
                        {log.decision}
                      </span>
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
