# Proteção de Tráfego — Mobile Only para Oferta (v2.0)

**Redirecionamento inteligente: mobile -> oferta real, todo resto -> disfarce**

Proteja `https://importa-chiina.vercel.app/` dos bots do TikTok Ads Manager, serviços de espionagem, concorrentes e qualquer tráfego indesejado.

---

## 🎯 COMO FUNCIONA

O sistema é um redirecionador de tráfego inteligente que fica na frente da sua oferta:

```
Link do Anúncio -> [/api/cloak] -> [Filtro Simples: Dispositivo + Bots] ->
    ✅ Mobile Real (Android / iOS) -> OFERTA (BLACK)
    ❌ Bots / PC / Mac / Desktop / Emulador -> DISFARCE (WHITE)
```

### 3 Etapas Simples

#### 1️⃣ Defina os 2 destinos
Conecte sua oferta de forma rápida e fácil. No painel, defina:
- **Site BLACK** = Sua oferta real (`https://importa-chiina.vercel.app/`) — para mobile
- **Site WHITE** = Seu disfarce (ex: `https://www.mundo-surf.com/...`) — para bots e desktop

#### 2️⃣ Crie sua campanha
Configure suas campanhas de marketing:
- Gere o link customizado com campaign_id
- O link é o mesmo para todos os dispositivos
- Cada clique é analisado pelo filtro de dispositivo

#### 3️⃣ Anuncie com link customizado
Use os links customizados gerados automaticamente no painel. Cada clique é analisado e só o tráfego mobile legítimo chega na sua oferta.

---

## 🛡️ FILTRO (regra única)

| O que chega | Para onde vai |
|-----------|-----------|
| **Celular real** (iPhone / Android / qualquer celular) | **SITE BLACK (oferta)** ✅ |
| **PC / Notebook / Mac / Linux** | **SITE WHITE (disfarce)** ❌ |
| **Bots / crawlers / robots / headless** | **SITE WHITE (disfarce)** ❌ |
| **Emuladores** (BlueStacks, Genymotion, etc.) | **SITE WHITE (disfarce)** ❌ |

Regra simples: **apenas 2 destinos possíveis — whiteUrl e blackUrl. Nada de telas de bloqueio, nada de intermediação, nada de redes sociais.**

---

## 📁 ESTRUTURA DO PROJETO

```
cloaker deep/
├── app/
│   ├── api/
├── app/
│   ├── api/
│   │   ├── cloak/
│   │   │   └── route.js          # NÚCLEO: redirecionamento (apenas 2 destinos)
│   │   ├── config/
│   │   │   └── route.js          # CRUD de filtros
│   │   ├── logs/
│   │   │   └── route.js          # Auditoria de acessos
│   │   └── seed/
│   │       └── config.js         # Seed de config
│   ├── admin/
│   │   └── page.js               # PAINEL ADMINISTRATIVO
│   ├── capture/
│   │   └── page.js               # Captura de leads (opcional, não usada no fluxo principal)
│   ├── health/
│   │   └── route.js              # Health check
│   ├── page.js                   # Landing "3 etapas" (página inicial)
│   └── layout.js                 # Layout global
├── utils/
│   ├── ua.js                     # Detecção de bot/mobile/emulador
│   ├── utm.js                    # Validação de params
│   └── ip.js                     # Utilitários de IP
├── .cloaker/
│   ├── config.json               # CONFIGURAÇÕES (privado — COMMITADO)
│   └── bypass_secret.txt         # Segredo de bypass (privado)
├── .gitignore                    # Regras de git
├── package.json
├── README.md                     # Este arquivo
└── start.bat                     # Inicia servidor local
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
