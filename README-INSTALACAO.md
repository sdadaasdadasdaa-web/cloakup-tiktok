# 🚀 Instruções de Instalação do CLOAKUP - TikTok Ads Protection

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta na Vercel (para deploy)

## Instalação Local

```bash
# 1. Navegue até a pasta do projeto
cd "C:\Users\User\Downloads\cloaker deep"

# 2. Instale as dependências
npm install

# 3. Inicie o servidor (build + start)
start.bat
```

Ou manualmente:

```bash
npm run dev
```

Acesse:
- http://localhost:3000 — Página inicial (estilo CloakUp)
- http://localhost:3000/admin — **Painel administrativo** ⭐
- http://localhost:3000/health — Health check

## Configuração Inicial (10 minutos)

### Passo 1: Acesse o Painel
```
http://localhost:3000/admin
```

### Passo 2: Defina a Oferta
No painel, em **"1️⃣ Adicione sua Oferta"**:
- **SITE BLACK**: `https://importa-chiina.vercel.app/` (sua oferta real)
- **SITE WHITE**: `https://www.mundo-surf.com/pt/news/prancha-de-surf/guia-completo-iniciante-surf` (disfarce)

### Passo 3: Crie a Campanha
Clique em **"+ Nova Campanha"** e preencha:
- **Nome**: ex: "Oferta Prancha Elétrica"
- **Codificador**: clique em "Gerar" (ex: `cam_x9k2p`)
- **SITE BLACK**: `https://importa-chiina.vercel.app/`
- **SITE WHITE**: seu disfarce

Clique em **"Criar Campanha"** e copie o link gerado.

### Passo 4: Verifique os Filtros
No painel, em **"3️⃣ Filtros de Proteção"**, verifique se estão ativos:
- ✅ Bots (sempre bloqueados)
- ✅ Proxy/VPN & Datacenter
- ✅ AdSpy & Espionagem
- ✅ Geolocalização
- ✅ Mobile-only (só iPhone/Android)
- ✅ Referência (tiktok.com)
- ✅ Parâmetros de URL (utm_source, utm_campaign, utm_medium, utm_content)

### Passo 5: Suba no TikTok Ads
1. Copie o link da campanha no painel
2. No **TikTok Ads Manager**, cole como URL de destino do anúncio
3. Configure os parâmetros de rastreamento (utm_source, utm_campaign, utm_medium, utm_content)
4. Publique o anúncio! 🚀

## Deploy na Vercel

```bash
# 1. Instale a CLI da Vercel (se não tiver)
npm i -g vercel

# 2. Faça login
vercel login

# 3. Faça o deploy
vercel deploy --prod
```

Ou importe diretamente no [vercel.com/new](https://vercel.com/new):
- Repositório: `https://github.com/sdadaasdadasdaa-web/cloaker-tiktok`
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`

⚠️ **Importante**: Após o deploy, `.cloaker/config.json` **não** vem do Git (está no `.gitignore`). Você precisa recriar as campanhas no painel `/admin` da Vercel.

## Testes

```bash
# Testes unitários
node test_manual.mjs

# Health check
curl http://localhost:3000/health
```

## Comandos Úteis

```bash
# Reiniciar servidor local
cmd /c "cd /d C:\Users\User\Downloads\cloaker deep && start.bat"

# Build para produção
npm run build

# Parar servidor
Ctrl + C no terminal
```

## Estrutura de Arquivos

```
cloaker deep/
├── app/
│   ├── api/
│   │   ├── cloak/route.js       # Engine principal de cloaking
│   │   ├── config/route.js      # CRUD de configurações
│   │   ├── config/token.js      # Gera token bypass
│   │   ├── logs/route.js        # Logs de acesso
│   │   ├── lead/route.js        # Captura de leads
│   │   └── proxy/route.js       # Proxy de checkout
│   ├── admin/page.js            # Painel administrativo
│   ├── capture/page.js          # Landing de captura
│   ├── health/route.js          # Health check
│   ├── page.js                  # Página inicial (estilo CloakUp)
│   └── layout.js                # Layout global
├── filters/
│   ├── engine.js                # Cascade de filtros (12+ camadas)
│   └── decisions.js             # Resolução por campanha
├── utils/
│   ├── ua.js                    # Detecção de bot/mobile/emulador
│   ├── utm.js                   # Validação de params TikTok
│   └── ip.js                    # Utilitários de IP/GeoIP
├── .cloaker/                    # DADOS PRIVADOS (não versionar)
│   ├── config.json              # Configuração mestre
│   ├── access.log               # Logs de acesso
│   └── bypass_secret.txt        # Segredo JWT do token bypass
├── package.json
├── vercel.json                  # Config de deploy
├── start.bat                    # Iniciar localmente
├── README.md                    # Visão geral
├── README-DEPLOY.md             # Instruções de deploy
└── GUIA_USUARIO.md              # Manual completo
```

## Segurança

- `.cloaker/` e `bypass_secret.txt` estão no `.gitignore` — **NUNCA** vá para o GitHub
- Token bypass JWT assinado — use só para testes ou VIPs
- Config e logs são 100% privados no seu servidor

## Suporte

Dúvidas? Consulte:
- `GUIA_USUARIO.md` — Manual completo do usuário
- `.cloaker/config.json` — Configuração mestre

---

Feito com ❤️ para proteger suas campanhas no TikTok Ads.
