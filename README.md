# Cloaker Genérico — estilo CloakUp / Clocap / Cloakup

Cloaker genérico para proteger qualquer oferta em anúncios de rede (TikTok Ads, Facebook Ads, etc.): bloqueia bots, libera **apenas celulares (Android/iOS) reais** com os params do anúncio completos, e envia os bloqueados para um site branco (disfarce).

---

## Como usar (3 passos)

### Passo 1 — Abra o painel
```
seusite.com/admin
```

### Passo 2 — Configure
1. **Site BLACK**: cole o link da sua oferta real (ex: `https://seu-landing.vercel.app/`). É pra aqui que o lead qualificado vai.
2. **Site WHITE**: cole um link normal (ex: um site de notícias). É pra aqui que bots, PCs e quem não cumpre os requisitos são redirecionados — parece uma página qualquer.
3. **Campanha**: cole seu link de anúncio do TikTok Ads e clique em **+ Adicionar**. O requisito já vem escrito:
   > `celular real + utm_source + utm_campaign + utm_medium + utm_content`

### Passo 3 — Publique seus anúncios
No TikTok Ads, use links assim:
```
https://seusite.com/?utm_source=tiktok&utm_campaign=campanha01&utm_medium=cpc&utm_content=criativo_a
```
(O cloaker intercepta na rota `/api/cloak/`, mas seu link pode ir direto pra raiz — o sistema funciona nos dois casos.)

---

## Regras fixas (não precisa configurar)

| Quem chega | Vai pra |
|---|---|
| Celular real + params do anúncio completOS | **Site BLACK** ✅ |
| Celular sem params completos | Site WHITE (disfarce) |
| PC / Notebook | Site WHITE |
| Bot (TikTok/Google/Facebook/ByteDance/scanner) | Site WHITE |
| Emulador (BlueStacks, Genymotion...) | Site WHITE |
| IP da whitelist (escritório / teste) | Site BLACK |
| Token bypass (`/?bypass=xyz`) | Site BLACK |

---

## Monitoramento

No painel (`/admin`), a aba **Log de acesso (tempo real)** mostra tudo que rola:

| Hora | IP | Dispositivo | Decisão |
|---|---|---|---|
| 12:34 | 187.x.x.x | iPhone | ALLOWED (pra Black) |
| 12:35 | 201.x.x.x | Windows | DECOY (pra White) |
| 12:36 | 177.x.x.x | Bot | BOT_BLOCKED |

E os 3 cartões no topo contam quantos cliques foram pro BLACK, quantos foram pro WHITE e quantos bots foram barrados.

---

## Regras do anúncio (os requisitos)

Para o clique ir pro site BLACK, o link tem que vir COMPLETO do TikTok Ads:

- `utm_source=tiktok`
- `utm_campaign=<nome_da_campanha>`
- `utm_medium=cpc`
- `utm_content=<nome_do_criativo>`

Se faltar qualquer um desses, o clique cai no site WHITE. Isso evita clique de bot ou clique perdido.

---

## Instalação

```bash
cd "C:\Users\User\Downloads\cloaker deep"
npm install
npm run dev
# servidor em http://localhost:3000
```

Acesse:
- `http://localhost:3000/admin` — painel (site black, site white, campanhas)
- `http://localhost:3000/health` — health check
- `http://localhost:3000/api/logs` — logs brutos

## Deploy na Vercel

```bash
vercel deploy --prod
```

O `vercel.json` já está configurado: funções nodejs em `/api/cloak/**` e rewrite para a função de cloaking.

---

## Estrutura

```
cloaker deep/
├── app/
│   ├── api/
│   │   ├── cloak/route.js    # NÚCLEO: decide quem entra (bot, mobile, params, token, whitelist)
│   │   ├── config/           # le/gravam config e o site BLACK/WHITE
│   │   ├── logs/             # auditoria de acesso
│   │   └── lead/capture.js   # (opcional) captura de lead
│   ├── admin/page.js         # painel simplificado
│   ├── capture/page.js       # landing de captura (opcional)
│   ├── health/route.js       # health check
│   ├── layout.js
│   └── page.js               # vitrine placeholder
├── utils/
│   ├── ua.js                 # detecta bot / mobile / emulador
│   └── utm.js                # valida params do anúncio
├── .cloaker/config.json      # sua config (não versionar!)
├── package.json
└── vercel.json
```

---

## Segurança

- Config e logs salvos em `.cloaker/` (fora do Git)
- Token bypass assinado com JWT — só quem tem o link secreto entra
- Proxy `/api/proxy/checkout` — se você redirecionar pro checkout, o TikTok nunca vê o link Black no referer
- Whitelist de IPs pra acesso de escritório/ferramentas de monitoramento

---

## Customizar / Configurações extra

- **Site BLACK / WHITE**: painel (`/admin`) — altera em tempo real
- **Bots bloqueados**: `.cloaker/config.json` → `strictTiktokBots` / `customBlockedUAs`
- **Geo bloqueio (paises permitidos/bloqueados)**: `.cloaker/config.json` → `geoSettings` (ative com `"enabled": true`)
- **Variveis de ambiente** (setup inicial, antes do painel): veja `.env.example` (`NEXT_PUBLIC_BLACK_URL`, `NEXT_PUBLIC_DECOY_URL`, `CLOAKER_MODE`, etc.)
- **Token bypass**: gerado em `/admin` ou via `POST /api/cloak/token`

© 2026 Cloaker Genérico.
