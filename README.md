# Sistema de Gerenciamento Interno da Concessionaria

Projeto separado por destino de deploy:

- `vercel/`: frontend estatico para publicar na Vercel.
- `railway/`: API Java/Spring Boot para publicar na Railway.

## Deploy

### Vercel

Importe este repositorio na Vercel usando:

- Root Directory: `vercel`
- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: `.`

Adicione a variavel de ambiente:

```env
BACKEND_URL=https://sua-api.up.railway.app
```

O `vercel/vercel.json` encaminha `/api/*` e `/uploads/*` para a API da Railway.

### Railway

Crie um servico na Railway usando o mesmo repositorio e configure:

- Root Directory: `railway`

Variaveis esperadas:

```env
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=concessionaria
JWT_SECRET=troque-por-um-segredo-grande
CORS_ALLOWED_ORIGINS=https://seu-site.vercel.app
RAILPACK_JDK_VERSION=21
```

O banco base esta em `railway/banco.sql`. Para fotos persistentes em producao, configure um volume na Railway e aponte `UPLOAD_DIR` para o caminho do volume.

## Rodar local

API:

```powershell
cd railway
Get-Content ..\.env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim().Trim('"').Trim("'"), 'Process')
  }
}
mvn spring-boot:run
```

Frontend:

```powershell
cd vercel
python -m http.server 5500
```

Abra `http://localhost:5500`.
