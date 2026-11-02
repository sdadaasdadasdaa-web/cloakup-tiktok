# CLOAKUP - TikTok Ads Protection (v2.0)

**Proteção de tráfego de alto nível para sua oferta no TikTok Ads**

Proteja `https://importa-chiina.vercel.app/` dos bots do TikTok Ads Manager, serviços de espionagem, concorrentes e qualquer tráfego indesejado.

---

## 🎯 COMO FUNCIONA (Estilo CloakUp / Therabot)

O CLOAKUP é um filtro de tráfego inteligente que fica na frente da sua oferta:

```
TikTok Ads → LINK CUSTOMIZADO DO CLOAKUP → [Cascata de 12+ Filtros] → 
    ✅ Mobile Real + Params TikTok → OFERTA (BLACK)
    ❌ Bots / PC / Proxy / Espião / Geobloqueado → DISFARCE (WHITE)
```

### 3 Etapas Simples

#### 1️⃣ Adicione seu domínio
Conecte sua oferta de forma rápida e fácil. No painel, defina:
- **Site BLACK** = Sua oferta real (`https://importa-chiina.vercel.app/`)
- **Site WHITE** = Seu disfarce (ex: `https://www.tiktok.com` ou site de notícias)

#### 2️⃣ Crie sua campanha
Configure suas campanhas de marketing com filtros personalizados:
- Filtre bots de análise e moderadores
- Bloqueie proxies, VPNs e serviços de espionagem (AdSpy)
- Defina geolocalização permitida/bloqueada
- Escolha dispositivos aceitos (mobile-only recomendado)
- Valide parâmetros de URL do TikTok Ads
- Mantenha whitelist/blacklist de IPs

#### 3️⃣ Anuncie com link customizado
Use os links customizados gerados automaticamente no painel. Cada clique é analisado e só o tráfego legítimo chega na sua oferta.

---

## 🛡️ PRINCIPAIS FILTROS

| Categoria | Descrição |
|-----------|-----------|
| **Bots** | Bloqueia bots do TikTok/ByteDance, Google, Facebook, crawlers, scanners (sqlmap, nikto), headless browsers (puppeteer, selenium, playwright) |
| **Proxy/VPN** | Detecta e bloqueia tráfego de datacenters, VPs, proxies anônimos |
| **AdSpy** | Bloqueia aplicativos de espionagem de anúncios (adspy, admonitor, etc.) |
| **Geolocalização** | Permite/bloqueia por país (via Cloudflare, ALB, headers) |
| **Dispositivos** | Mobile-only, desktop bloqueado, tablets, emuladores (BlueStacks, Genymotion) |
| **Referência** | Valida se o tráfego veio de tiktok.com / vm.tiktok.com |
| **Parâmetros de URL** | Exige utm_source, utm_campaign, utm_medium, utm_content |
| **Linguagem do Navegador** | Filtra por Accept-Language (ex: só pt-BR, en-US) |
| **User Agent** | Bloqueia UAs específicos ou padrões personalizados |
| **ISP** | Bloqueia provedores de datacenter/conteúdo |
| **Whitelist/Blacklist** | Sua própria lista de IPs permitidos ou bloqueados |

---

## 📁 ESTRUTURA DO PROJETO

```
cloaker deep/
├── app/
│   ├── api/
│   │   ├── cloak/
│   │   │   ├── route.js          # NÚCLEO: engine de cloaking (cascade de filtros)
│   │   │   └── token.js          # Gera token bypass estilo CloakUp
│   │   ├── config/
│   │   │   └── route.js          # CRUD completo de filtros
│   │   ├── logs/
│   │   │   └── route.js          # Auditoria de acessos em tempo real
│   │   ├── lead/
│   │   │   └── route.js          # Captura de leads (opcional)
│   │   └── proxy/
│   │       └── route.js          # Proxy de checkout (oculta link BLACK do referer)
│   ├── admin/
│   │   └── page.js               # PAINEL ADMINISTRATIVO (estilo CloakUp)
│   ├── capture/
│   │   └── page.js               # Landing de captura (modo moderate)
│   ├── health/
│   │   └── route.js              # Health check
│   ├── page.js                   # Landing "3 etapas" (página inicial)
│   └── layout.js                 # Layout global
├── filters/
│   ├── engine.js                 # Motor de cascade de filtros
│   ├── bot-filter.js             # Filtro de bots
│   ├── proxy-filter.js           # Filtro de proxy/VPN/datacenter
│   ├── ads spy-filter.js         # Filtro de AdSpy
│   ├── geo-filter.js             # Filtro de geolocalização
│   ├── device-filter.js          # Filtro de dispositivos
│   ├── referer-filter.js         # Filtro de referer
│   ├── params-filter.js          # Filtro de parâmetros URL
│   ├── lang-filter.js            # Filtro de linguagem
│   ├── ua-filter.js              # Filtro de User Agent
│   ├── isp-filter.js             # Filtro de ISP
│   ├── whitelist-filter.js       # Whitelist/Blacklist de IPs
│   └── decision.js               # Resolvedor de decisão final
├── utils/
│   ├── ua.js                     # Detecção de bot/mobile/emulador
│   ├── utm.js                    # Validação de params TikTok
│   └── ip.js                     # Utilitários de IP/geolocalização
├── .cloaker/
│   ├── config.json               # CONFIGURAÇÕES COMPLETAS (privado)
│   └── access.log                # LOGS DE ACESSO (privado)
├── package.json
├── vercel.json                   # Config de deploy
├── start.bat                     # Iniciar localmente
├── README.md                     # Este arquivo
└── GUIA_USUARIO.md               # Manual completo do usuário
```

---

## 🚀 INSTALAÇÃO E RUN

### Localmente

```bash
cd "C:\Users\User\Downloads\cloaker deep"
npm install
start.bat
```

Acesse:
- `http://localhost:3000` → Landing "Como funciona" (3 etapas)
- `http://localhost:3000/admin` → Painel administrativo (crie campanhas)
- `http://localhost:3000/health` → Health check

### Na Vercel

```bash
vercel deploy --prod
```

Ou importe o repositório no [vercel.com/new](https://vercel.com/new).

---

## 🔗 LINK CUSTOMIZADO

Gerado automaticamente no painel `/admin`:

```
https://SEU-CLOAKUP.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_XXXXX&utm_medium=cpc&utm_content=anti&campaign_id=cam_XXXXX
```

**Suba esse link no TikTok Ads como destino do anúncio.**

### Regras para o clique ir pra OFERTA (BLACK):
- ✅ Celular real (iPhone/Android)
- ✅ Params completos: `utm_source=tiktok`, `utm_campaign`, `utm_medium=cpc`, `utm_content`
- ✅ Referer do tiktok.com (opcional, reforça validação)

**Qualquer outra combinação → DISFARCE (WHITE)**

---

## 🎪 PAINEL ADMINISTRATIVO

Acesse `/admin` e veja:

1. **Configuração da oferta**: Site BLACK + Site WHITE
2. **Campanhas**: Crie, edite, exclua campanhas com links customizados
3. **Filtros**: Ative/Desative e configure cada categoria de filtro
4. **Logs em tempo real**: Atualiza a cada 3s com filtro por campanha
5. **Stats**: Contagem de ALLOWED (BLACK), DECOY (WHITE), BLOCKED (bots)

### Token Bypass
Estilo CloakUp — URL secreta que libera qualquer dispositivo (para testes):

```
https://SEU-CLOAKUP.vercel.app/api/cloak?bypass=SEU_TOKEN_JWT
```

Gerado em `/admin` → Aba "Segurança" → "Gerar Token Bypass"

---

## 🔒 SEGURANÇA

- Config e logs em `.cloaker/` (**nunca** no Git)
- Token bypass JWT assinado — só quem tem o link secreto entra
- Proxy `/api/proxy/checkout` — oculta o link BLACK do referer
- Whitelist de IPs pra escritório/monitoramento
- Proteção contra espionagem e crawlers

---

## 📋 COMANDOS RÁPIDOS

```bash
# Reiniciar servidor local
cmd /c "cd /d C:\Users\User\Downloads\cloaker deep && start.bat"

# Build para produção
npm run build

# Rodar na Vercel
vercel deploy --prod
```

---

## 🤝 BASEADO EM

- **CloakUp** — Conceito de link customizado + filtros por campanha
- **Therabot** — Cascade de filtros e decisão por campanha
- **Clocap** — Token bypass estilo JWT

© 2026 CLOAKUP — Proteção de Tráfego para TikTok Ads.
