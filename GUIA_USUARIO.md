# CLOAKUP - Manual do Usuário

## Visão Geral

O **CLOAKUP** é um filtro de tráfego de alto nível projetado para proteger sua oferta no TikTok Ads. Ele se inspira nas melhores práticas do **CloakUp**, **Therabot** e **Clocap**.

---

## 🎯 Objetivo

Proteger a oferta **https://importa-chiina.vercel.app/** dos bots do TikTok Ads Manager, serviços de espionagem e tráfego indesejado:

- ✅ **Mobile real (iPhone/Android)** com params do TikTok → **LIBERADO** pra oferta (BLACK)
- ❌ **PC, bots, crawlers, proxies, VPNs, espionagem** → **BLOQUEADO** no disfarce (WHITE)

---

## 📝 ETAPA 1: Adicionar Domínio / Configurar Oferta

### Acesse o Painel
```
http://localhost:3000/admin   (local)
https://seu-cloaker.vercel.app/admin   (produção)
```

### Defina os Sites
1. **Site BLACK (oferta real)**: `https://importa-chiina.vercel.app/`
   - É para aqui que vai o tráfego legítimo (mobile + params)
2. **Site WHITE (disfarce)**: ex: `https://www.tiktok.com` ou um site de notícias
   - É para aqui que vão bots, PCs, e quem não cumpre os requisitos

### Como funciona o disfarce
O site WHITE deve parecer uma página qualquer — um post de notícia, vídeo do TikTok, blog. Isso evita suspeitas se alguém acessar o link sem passar nos filtros.

---

## 📝 ETAPA 2: Criar Campanha

No painel `/admin`, clique em **"Nova Campanha"**:

1. **Nome da campanha**: ex: `Oferta Prancha Eletrica`, `Black Friday`
2. **Codificador (campaign_id)**: gerado automaticamente (ex: `cam_abc123`)
3. **Site BLACK**: sua oferta
4. **Site WHITE**: seu disfarce

### Configure os Filtros

No painel, a aba **"Filtros"** permite configurar:

#### Bots
- ✅ **Bots TikTok/ByteDance** — sempre bloqueados
- ✅ **Bots de busca** (Googlebot, Bingbot) — opcionais
- ✅ **Headless browsers** (puppeteer, selenium, playwright)
- ✅ **Scanners** (sqlmap, nikto, nmap)
- ✅ **Emuladores** (BlueStacks, Genymotion, LDPlayer)

#### Proxy/VPN
- 🚫 Bloqueia IPs de datacenter, cloud, hosting
- 🚫 Bloqueia proxies anônimos e VPNs
- ⚠️ Use com cuidado: pode bloquear alguns usuários legítimos em redes corporativas

#### AdSpy
- 🚫 Bloqueia apps de espionagem de anúncios (AdSpy, AdMonitor, SocialBlade, Exolyt)
- Essencial para evitar que concorrentes monitoruem seus anúncios

#### Geolocalização
- 🌍 **Países permitidos**: ex: `BR`, `US`, `PT` (deixe vazio para permitir todos)
- 🚫 **Países bloqueados**: ex: `CN`, `RU`, `KP`
- Detectado via headers de CDN (Cloudflare: `CF-IPCountry`)

#### Dispositivos
- 📱 **Mobile-only**: só celulares reais (iPhone/Android) entram
- 🚫 Desktops, tablets, emuladores bloqueados
- ⚙️ Desative para permitir desktop

#### Referência (Referer)
- ✔️ Exige que o tráfego venha de `tiktok.com`, `vm.tiktok.com`, `vt.tiktok.com`
- Reforça a validação de que o clique veio do TikTok Ads

#### Parâmetros de URL
- ✔️ Exige: `utm_source=tiktok`, `utm_campaign`, `utm_medium=cpc`, `utm_content`
- Qualquer coisa fora disso → disfarce
- **Importante**: o TikTok Ads precisa enviar esses params — configure no TikTok Ads Manager os parâmetros de rastreamento!

#### Idioma do Navegador
- 🌐 Exige `pt-BR`, `pt-PT`, `en-US`, etc.
- Útil para ofertas voltadas a um país específico

#### User Agent
- 🔧 Adicione padrões customizados de UA a bloquear
- Ex: UA de apps específicos que você não quer

#### ISP
- 🏢 Bloqueia provedores de datacenter (AWS, Azure, Google Cloud, etc.)
- Em produção, requer integração com API de GeoIP

#### Whitelist/Blacklist de IPs
- ✅ **Whitelist**: IPs que SEMPRE entram (seu escritório, ferramentas de teste)
- 🚫 **Blacklist**: IPs que SEMPRE são bloqueados

---

## 📝 ETAPA 3: Anunciar com Link Customizado

### Gere o Link
No painel, após criar a campanha, clique em **"COPIAR LINK"**.

O link gerado será:
```
https://seu-cloaker.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_abc123&utm_medium=cpc&utm_content=anti&campaign_id=cam_abc123
```

### Suba no TikTok Ads

1. No **TikTok Ads Manager**, crie um novo anúncio
2. No campo **URL de destino**, cole o link customizado do CLOAKUP
3. Publique o anúncio

### Configuração no TikTok Ads Manager

Para que os params cheguem completos:
1. Crie uma **Tag de conversão** ou use **URL personalizada**
2. Adicione os parâmetros de rastreamento: `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`
3. O TikTok substituirá automaticamente os valores dinâmicos

---

## 🔍 COMO TESTAR

### 1. Testar no Celular (mobile real + params)
Acesse o link customizado do seu celular com os params completos do TikTok:
```
https://seu-cloaker.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_abc123&utm_medium=cpc&utm_content=anti&campaign_id=cam_abc123
```
➡️ Deve ir para o **SITE BLACK** ✅

### 2. Testar no PC
Abra o mesmo link no Chrome/Firefox do PC:
➡️ Deve ir para o **SITE WHITE** ❌

### 3. Testar Bot
Use um UA de bot:
```bash
curl -A "TikTok Advertising/1.0" https://seu-cloaker.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_abc123&utm_medium=cpc&utm_content=anti
```
➡️ Deve retornar **BLOCKED** ❌

### 4. Verificar Logs
Acesse `/admin` → **Log de acesso (tempo real)**:
- Atualiza a cada 3 segundos
- Filtre por campanha
- Veja IP, dispositivo, decisão

---

## 🔐 SEGURANÇA

### Token Bypass (estilo CloakUp)
Link secreto que libera qualquer dispositivo — use só para testes:

```
https://seu-cloaker.vercel.app/api/cloak?bypass=SEU_TOKEN_JWT
```

Gere no painel: `/admin` → **Configurações** → **Token Bypass** → **Gerar Token**

> ⚠️ **NUNCA** compartilhe seu token bypass publicamente!

### Proteção de Dados
- Config e logs salvos em `.cloaker/` (fora do Git)
- `.bypass_secret.txt` — segredo JWT (fora do Git)
- Nenhum dado sai do seu servidor

### Proxy de Checkout
Se sua oferta tem checkout, use `/api/proxy/checkout` para esconder o link BLACK do referer:
```
https://seu-cloaker.vercel.app/api/proxy/checkout?url=SEU_CHECKOUT_BLACK
```

---

## 🚀 DEPLOY NA VERCEL

```bash
# 1. Instale a CLI da Vercel
npm i -g vercel

# 2. Faça login
vercel login

# 3. Faça o deploy
vercel deploy --prod
```

Ou importe o repositório direto no [vercel.com/new](https://vercel.com/new):
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`

---

## 🛠️ COMANDOS RÁPIDOS

```bash
# Iniciar localmente
start.bat

# Reiniciar servidor local
cmd /c "cd /d C:\Users\User\Downloads\cloaker deep && start.bat"

# Build para produção
npm run build

# Rodar na Vercel
vercel deploy --prod

# Parar servidor
# Ctrl+C no terminal
```

---

## 📊 MONITORAMENTO

No painel `/admin`:

- **Campanhas**: gerencie ofertas e links
- **Filtros**: ative/desative cada categoria
- **Logs**: auditoria em tempo real (3s)
- **Stats**: quantos cliques foram para BLACK vs WHITE vs BOTS

---

## ❓ TROUBLESHOOTING

### "Meus logs mostram muitos DECOY no mobile"
- Verifique se os params `utm_source, utm_campaign, utm_medium, utm_content` estão chegando
- No TikTok Ads, certifique-se de que os parâmetros de rastreamento estão ativos
- Teste acessando diretamente do celular

### "Bots ainda estão entrando"
- Ative o filtro de bots estrito
- Adicione mais assinaturas de UA em `strictTiktokBots`
- Verifique o filtro de IP/datacenter

### "Mobile legítimo vai pro WHITE"
- Verifique se `forceMobileOnly` está correto
- Teste com UA de iPhone/Android real
- Verifique se os params estão todos presentes

### "Config sumiu após deploy"
- `.cloaker/config.json` está no `.gitignore` — ele não é versionado
- Após deploy na Vercel, recrie as campanhas no painel `/admin`
- As configurações persistem no servidor Vercel

---

## 📞 SUPORTE

- README.md — visão geral do projeto
- GUIA_USUARIO.md — este manual
- `.cloaker/config.json` — configuração mestre

© 2026 CLOAKUP — Proteção de Tráfego para TikTok Ads
