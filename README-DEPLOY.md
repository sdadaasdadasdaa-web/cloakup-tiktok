# 🚀 DEPLOY NA VERCEL - Proteção de Tráfego

Este projeto precisa ser deployado na Vercel para acessar o `/api/cloak` pela internet.

---

## ⚠️ IMPORTANTE ANTES DE DEPLOYAR

Os arquivos **`.cloaker/config.json`** e **`.cloaker/access.log`** são **privados** e estão no `.gitignore`.

**Você tem 2 opções:**

### Opção A: Criar as variáveis de ambiente na Vercel (recomendado)

1. Na Vercel, vá em **Settings > Environment Variables**
2. Adicione:
   - `CLOAKER_BLACK_URL` → `https://importa-chiina.vercel.app/` (oferta real, para mobile)
   - `CLOAKER_WHITE_URL` → `https://www.mundo-surf.com/...` (disfarce, para bots e PC)
3. O `route.js` lerá desse ambiente se não achar o arquivo

### Opção B: Subir o `.cloaker` commitando temporariamente

1. `git add .cloaker/config.json`
2. `git commit -m "config"`
3. Deploy
4. Depois remova do git: `git rm --cached -r .cloaker` + commit
5. **Não** faça push do `.cloaker` de volta (fica inseguro no GitHub)

**⚠️ CUIDADO:** Se subir o `.cloaker` pro GitHub público, **QUALQUER UM VÊ SEUS LOGS, CAMPAÑHAS E CONFIGURAÇÕES**. Use repo PRIVADO ou a Opção A.

---

## 📋 PASSO A PASSO DEPLOY (manual)

1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub (ou arraste a pasta)
3. Configurações automáticas:
   - **Framework Preset:** Next.js ✅
   - **Build Command:** `npm run build` ✅
   - **Output Directory:** `.next` ✅
4. Clique em **Deploy**
5. Aguarde (~2-3 minutos)

**Seu link vai ser:**
```
https://seu-projeto.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_xxxxx&utm_medium=cpc&utm_content=anti&campaign_id=cam_xxxxx
```

---

## 🔄 DEPLOY via GitHub (automático)

Se já tem o repo no GitHub:

```bash
cd "C:\Users\User\Downloads\cloaker deep"
git init
git add .
git commit -m "cloaker pronto"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Depois importa na Vercel conectando o GitHub → deploy automático!

---

## ✅ VERIFICANDO O DEPLOY

Após o deploy, teste:

1. **No PC (deve ir pro WHITE):**
   ```
   https://seu-projeto.vercel.app/api/cloak?utm_source=tiktok&utm_campaign=cam_sluia8&utm_medium=cpc&utm_content=anti&campaign_id=cam_sluia8
   ```

2. **No Celular (deve ir pro BLACK/importa-chiina):**

3. **Admin (para criar campanhas e ver logs):**
   ```
   https://seu-projeto.vercel.app/admin
   ```

---

## 🔧 SE DER ERRO NO DEPLOY

Problemas comuns:

1. **"Failed to find next.config.js"**: o projeto já tem `next.config.js` ✅
2. **Tela branca no deploy**: limpar o cache do navegador (Ctrl+Shift+Delete)
3. **404 no /api/cloak**: garantir que o build completou e ver o log na Vercel
4. **Erros de module**: executar `npm install` antes do build

---

## 📞 SE PRECISAR DE AJUDA

Me manda o **log do erro** da Vercel (Settings > Deployments > clique no build falhou > View Logs) que eu corrijo!
