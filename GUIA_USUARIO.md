# Como usar o Cloaker — Passo a Passo

Esta é a versão simplificada do cloaker. Você só precisa de 3 coisas:

1. **Site BLACK** — sua oferta real (landing page de vendas)
2. **Site WHITE** — um site qualquer (notícia, blog, YouTube) pra disfarce
3. **Seus links de anúncio** do TikTok/Facebook

---

## Passo 1 — Subir o projeto

```bash
cd "C:\Users\User\Downloads\cloaker deep"
npm install
npm run dev
```

Vai abrir em `http://localhost:3000`

## Passo 2 — Configurar o painel

Acesse: `http://localhost:3000/admin`

O painel tem só 3 blocos:

### Bloco 1 — Site BLACK

Cole seu link de vendas real, ex:

```
https://seu-site.vercel.app/
```

É pra AQUI que o lead qualificado (celular + params do anúncio) vai ser mandado.

### Bloco 2 — Site WHITE

Cole um site qualquer pra onde os bloqueados vão, ex:

```
https://www.mundo-surf.com/pt/news/prancha-de-surf/guia-completo-iniciante-surf
```

Quem for bloqueado (PC, bot, emulator, params faltando) abre esse site — parece normal, ninguém desconfia.

### Bloco 3 — Campanha / Link de anúncio

Cole seu link de anúncio (do TikTok Ads Manager) e clique em **+ Adicionar**.

Ex: `https://www.tiktok.com/@suaconta/video/1234567890`

Aí ele já mostra os **requisitos** dessa campanha:

> `celular real + utm_source + utm_campaign + utm_medium + utm_content`

---

## Passo 3 — Criar os anúncios

No TikTok Ads Manager, crie seus anúncios com o link assim:

```
https://SEU-SITE.com/?utm_source=tiktok&utm_campaign=campanha01&utm_medium=cpc&utm_content=criativo_a
```

Tem que vir **os 4 params**:

| Param | Exemplo |
|---|---|
| `utm_source` | `tiktok` |
| `utm_campaign` | `campanha01` |
| `utm_medium` | `cpc` |
| `utm_content` | `criativo_a` |

---

## Passo 4 — Monitorar (na hora)

No mesmo painel `/admin`, rola uma tabela em tempo real:

| Hora | IP | Dispositivo | Decisão |
|---|---|---|---|
| 12:34 | 187.x.x.x | iPhone | ALLOWED (pra Black) |
| 12:35 | 201.x.x.x | Windows | DECOY (pra White) |
| 12:36 | 177.x.x.x | Bot | DECOY (pra White) |

E tem 3 cartões no topo:

- **Pra Site BLACK** — quantos leads qualificados chegaram
- **Pra Site WHITE (bloqueados)** — quantos foram desviados
- **Bots bloqueados** — quantos bots tentaram acessar

Se um clique não foi pro BLACK, olha esse log: tá vindo de PC? Tá sem params? É bot? Aí você corrige.

---

## Como o cloaker decide (regras fixas)

| Entra -> Site BLACK | Sai -> Site WHITE |
|---|---|
| Celular real (Android/iOS) | PC / Notebook / Mac |
| Params do anúncio completos | Params faltando/incompletos |
| IP whitelist (escritorio/teste) | Bots (TikTok, Google, Facebook, ByteDance...) |
| Token bypass (?/bypass=xyz) | Emuladores (BlueStacks, etc.) |

---

## Token bypass (só pra você testar)

Se quiser testar de PC ou de casa sem passar pelos filtros:

1. No painel `/admin`, role até o fim
2. Botão **"Gerar Token"**
3. Copia o link: `seusite.com/?bypass=SEU_TOKEN`
4. Abra que entra em qualquer dispositivo

Guarda esse token em segundopara emergencias ou VIPs.

---

## Colocar no ar (Vercel)

```bash
vercel deploy --prod
```

Depois usa o dominio que a Vercel mandar nos passos 2 e 3 acima.

---

## Dicas

- **Sempre teste antes de subir campanha:** abra no navegador de celular e veja se vai pro BLACK.
- **Sites WHITE:** use sites de nicho que facam sentido pro seu publico (se vende equipamento de surf, usa site de surfe; se vende suplemento, usa site de academia). Fica mais crivel.
- **Nao use `tiktok.com` como WHITE** — muito obvio.
- **Anuncios quebrados:** se muitos cliques forem pro WHITE, verifique se os params no Ads Manager estao todos ativados (especialmente `utm_content`).

---

Arquivos que você vai mexer so se quiser customizar:

- `app/api/cloak/route.js` — regras de quem entra
- `utils/ua.js` — lista de bots detectados
- `app/api/config/read.js` / `save.js` — onde a config e salva
- `app/api/logs/index.js` — onde os logs ficam

---

Feito? É só isso. Abre o painel, cadastra, posta o anuncio e acompanha o log.
