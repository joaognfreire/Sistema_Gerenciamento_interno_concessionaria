# Frontend - Vercel

Projeto estatico do painel da concessionaria.

## Deploy na Vercel

Configure o projeto na Vercel com:

- Root Directory: `vercel`
- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: `.`

Variavel de ambiente:

```env
BACKEND_URL=https://sua-api.up.railway.app
```

`vercel.json` encaminha:

- `/api/*` para `${BACKEND_URL}/api/*`
- `/uploads/*` para `${BACKEND_URL}/uploads/*`

Em localhost, o frontend usa `http://localhost:8080/api`.
Em producao, usa `/api`.
