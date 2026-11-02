# CLOAKUP v2.0 — ENTREGA FINAL 🎉
## Filtragem de Tráfego de Alto Nível para TikTok Ads (Estilo CloakUp / Therabot)

**Proteção criada para:** `https://importa-chiina.vercel.app/`

---

## ✅ STATUS

- ✅ **30/30 testes unitários do engine de cloaking** — TODOS PASSANDO
- ✅ **20/20 testes unitários utils/utm.js + utils/ua.js** — TODOS PASSANDO
- ✅ **Engine de cascade de 12+ filtros** funcional
- ✅ **Painel administrativo** estilo CloakUp (3 etapas + dashboard)
- ✅ **Token bypass** estilo CloakUp/Clocap funcionando
- ✅ **Filtros por campanha** estilo Therabot
- ✅ **Logs em tempo real** (atualização a cada 3s)
- ✅ **`.cloaker/` e `bypass_secret.txt` no `.gitignore`** — privado

**Executar testes:** `node tests/manual_cloaker_test.mjs`

---

## 🎯 COMO FUNCIONA

```
TikTok Ads → LINK CUSTOMIZADO DO CLOAKUP → [Cascata de 12+ Filtros] → 
    ✅ mobile real + params TikTok → OFERTA (BLACK)
    ❌ bots / PC / proxy / espionagem / geo bloqueado → DISFARCE (WHITE)
```

---

## 🧪 RESULTADOS DOS TESTES

### Engine de Filtros — 30/30 ✅
| Categoria | Cenários | Resultado |
|-----------|----------|-----------|
| Principais (mobile/desktop/bots) | 16 | ✅ PASS |
| Avançados (whitelist/geo/blacklist/adspy/lang/custom-ua) | 8 | ✅ PASS |
| Token bypass (válido/expirado/inválido/param alt) | 4 | ✅ PASS |
| Campanha específica | 2 | ✅ PASS |

**Comando:** `node tests/manual_cloaker_test.mjs`

### Utils/UTM + Utils/UA — 20/20 ✅
| Módulo | Testes | Resultado |
|--------|--------|-----------|
| `utils/utm.js` | 10 | ✅ PASS |
| `utils/ua.js` | 10 | ✅ PASS |

**Comando:** `node test_manual.mjs`

---

## 🚀 COMO USAR (3 ETAPAS)

### Passo 1 — Abrir o painel
```bash
cd "C:\Users\User\Downloads\cloaker deep"
start.bat
```
Acesse: **http://localhost:3000/admin**

### Passo 2 — Configurar a oferta
No painel `/admin`:

1. **Etapa 1 — Adicione sua Oferta:**
   - SITE BLACK: `https://importa-chiina.vercel.app/`
   - SITE WHITE: `https://www.mundo-surf.com/pt/news/prancha-de-surf/guia-completo-iniciante-surf`

2. **Etapa 2 — Crie sua Campanha:**
   - Clique em **+ Nova Campanha**
   - Nome: ex: "Oferta Prancha Elétrica"
   - Clique em "Gerar" (campaign_id ex: `cam_x9k2p`)
   - Preencha SITE BLACK e SITE WHITE
   - Clique em **Criar Campanha**
   - Clique em **COPIAR LINK**

3. **Etapa 3 — Anuncie:**
   - Cole o link no **TikTok Ads Manager**
   - Configure parâmetros: utm_source, utm_campaign, utm_medium, utm_content

### Link gerado:
```
https://SEU-CLOAKUP.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_x9k2p&utm_medium=cpc&utm_content=anti&campaign_id=cam_x9k2p
```

---

## 🛡️ FILTROS DISPONÍVEIS (Painel /admin → 3️⃣ Filtros de Proteção)

| Filtro | Status | Descrição |
|--------|--------|-----------|
| 🤖 Bots & Crawlers | ✅ Ativo | TikTok/ByteDance, Google, Facebook, scanners (sqlmap/nikto), headless (puppeteer/selenium/playwright), emuladores (BlueStacks/Genymotion) |
| 🌐 Proxy/VPN & Datacenter | ✅ Ativo | Detecta IPs de datacenter, cloud, VPN e proxies |
| 👁️ AdSpy & Espionagem | ✅ Ativo | AdSpy, AdMonitor, SocialBlade, Exolyt |
| 🌍 Geolocalização | ✅ Ativo | allowedCountries / blockedCountries por país |
| 📱 Dispositivos | ✅ Ativo | Mobile-only (iPhone/Android), desktop/tablet bloqueado |
| 🔗 Referência (Referer) | ✅ Ativo | Exige tiktok.com / vm.tiktok.com |
| 🔖 Parâmetros de URL | ✅ Ativo | utm_source + campaign + medium + content |
| 🌐 Idioma do Navegador | ⚙️ Opcional | Filtra por Accept-Language (pt-BR, en-US...) |
| 👤 User Agent Custom | ⚙️ Opcional | Padrões de UA a bloquear |
| 🏢 ISP / Provedor | ⚙️ Opcional | Bloqueia datacenter providers |
| 🔐 Whitelist / Blacklist | ✅ Ativo | Lista própria de IPs |

---

## 📊 RESULTADO ESPERADO NO TIKTOK ADS

| Quem chega | Onde vai | Motivo |
|------------|----------|--------|
| iPhone/Android REAL + params completos | **SITE BLACK** ✅ | Lead legítimo |
| PC / Notebook / Mac | **SITE WHITE** ❌ | Desktop bloqueado (mobile-only) |
| Bot TikTok Advertising / Ads Manager | **BLOQUEADO 403** ❌ | Bot estrito |
| ByteDance / omnilabs | **BLOQUEADO 403** ❌ | Bot ByteDance |
| Googlebot / Facebook crawler / sqlmap | **BLOQUEADO 403** ❌ | Bot conhecido |
| Selenium / Playwright / Puppeteer | **BLOQUEADO 403** ❌ | Headless |
| BlueStacks / Genymotion | **BLOQUEADO 403** ❌ | Emulador |
| Proxy / VPN / Datacenter IP | **BLOQUEADO 403** ❌ | IP suspeito |
| AdSpy / SocialBlade | **BLOQUEADO 403** ❌ | Espionagem |
| País bloqueado (CN/RU/KP) | **BLOQUEADO 403** ❌ | Geo bloqueado |
| Mobile sem params | **SITE WHITE** ❌ | params faltando (moderate) |
| IP whitelist | **SITE BLACK** ✅ | IP permitido |
| Token bypass válido | **SITE BLACK** ✅ | Token secreto |

---

## 📁 ESTRUTURA DO PROJETO

```
cloaker deep/
├── app/
│   ├── api/
│   │   ├── cloak/route.js           # NÚCLEO — cascata de 12+ filtros
│   │   ├── config/route.js          # CRUD de configurações
│   │   ├── config/token.js          # Gera token bypass (JWT/HMAC)
│   │   ├── logs/route.js            # Logs de auditoria
│   │   ├── lead/route.js            # Captura de leads
│   │   └── proxy/route.js           # Proxy de checkout (oculta link BLACK)
│   ├── admin/page.js                # PAINEL (estilo CloakUp: 3 etapas + stats)
│   ├── capture/page.js              # Landing de captura (modo moderate)
│   ├── health/route.js              # Health check
│   ├── page.js                      # Página "3 etapas" (como CloakUp)
│   └── layout.js                    # Layout global
├── filters/
│   ├── engine.js                    # Motor de cascade de filtros
│   └── decisions.js                 # Resolução por campanha
├── utils/
│   ├── ua.js                        # Detecção bot/mobile/emulador (20 testes)
│   ├── utm.js                       # Validação de params TikTok (10 testes)
│   └── ip.js                        # GeoIP / datacenter detection
├── .cloaker/                        # DADOS PRIVADOS (.gitignore ✅)
│   ├── config.json                  # Configuração mestre
│   ├── access.log                   # Logs de acesso
│   └── bypass_secret.txt            # Segredo JWT do token bypass
├── tests/
│   ├── unit/utm_test.js             # 10 testes UTM
│   ├── unit/ua_test.js              # 10 testes UA
│   ├── unit/engine_test.js          # 31 cenários engine (formato Node test runner)
│   ├── e2e/cloaker_e2e_test.js      # E2E original
│   └── manual_cloaker_test.mjs      # 30 testes engine executáveis ✅
├── package.json
├── vercel.json
├── start.bat
├── README.md                        # Visão geral
├── README-INSTALACAO.md             # Instalação detalhada
├── GUIA_USUARIO.md                  # Manual completo + troubleshooting
└── ENTREGA.md                       # Este arquivo
```

---

## ⚠️ IMPORTANTE — DEPLOY NA VERCEL

`.cloaker/config.json` está no `.gitignore` → **não é versionado**. Após deploy:

1. Acesse `https://SEU-CLOAKER.vercel.app/admin`
2. Recrie as campanhas no painel
3. Copie os links para o TikTok Ads

Nenhuma configuração vazará para o GitHub.

Deploy:
```bash
vercel deploy --prod
```

---

## 🛠️ COMANDOS RÁPIDOS

```bash
# Iniciar localmente
start.bat

# Reiniciar servidor local
cmd /c "cd /d C:\Users\User\Downloads\cloaker deep && start.bat"

# Testar engine de filtros (30 testes)
node tests/manual_cloaker_test.mjs

# Testar utils (20 testes)
node test_manual.mjs

# Health check
curl http://localhost:3000/health

# Build para produção
npm run build

# Deploy na Vercel
vercel deploy --prod
```

---

## 🔐 SEGURANÇA

- Token bypass JWT assinado (estilo CloakUp/Clocap) — válido 30 dias
- `.cloaker/` e `.bypass_secret.txt` no `.gitignore`
- Config e logs 100% privados no servidor
- Proxy `/api/proxy/checkout` — oculta link BLACK do referer
- Whitelist de IPs para escritório/monitoramento

---

## 📞 SUPORTE

- `GUIA_USUARIO.md` — manual completo + troubleshooting
- `README-INSTALACAO.md` — instalação passo a passo
- `app/admin/page.js` — painel administrativo
- `.cloaker/config.json` — configuração mestre

---

**Feito para proteger suas campanhas no TikTok Ads.**
🎉 CLOAKUP v2.0 — Pronto para proteger `https://importa-chiina.vercel.app/`
