# Backend Java - Concessionaria

API REST em Java/Spring Boot para o sistema interno da concessionaria. O front em HTML/CSS/JavaScript pode consumir todos os endpoints usando JSON e token Bearer.

## Como rodar

1. Crie o banco:

```bash
mysql -u root -p < ../banco.sql
```

2. Configure o `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=concessionaria
```

3. Rode o backend:

```bash
mvn spring-boot:run
```

Neste Mac, caso `mvn` nao esteja no PATH, o Maven da IDE tambem funciona:

```bash
"/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/bin/mvn" spring-boot:run
```

O servidor sobe em `http://localhost:8080`.

Usuario inicial criado pelo `banco.sql`:

- CPF: `00000000000`
- Senha: `admin123`
- Cargo: `DONO`

No primeiro login, a senha inicial em texto e migrada automaticamente para PBKDF2 no banco.

## Autenticacao

Envie login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "cpf": "00000000000",
  "senha": "admin123"
}
```

Use o token retornado no front:

```http
Authorization: Bearer TOKEN_AQUI
```

## Endpoints principais

### Login

- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard`

Campos financeiros aparecem apenas para `GERENTE_FINANCEIRO` e `DONO`. Estatisticas de colaboradores/carros aparecem para `GERENTE` ou superior.

### Colaboradores

Permissao: `GERENTE`, `GERENTE_FINANCEIRO`, `DONO`.

- `GET /api/colaboradores?busca=ana&ativo=true`
- `GET /api/colaboradores/{id}`
- `POST /api/colaboradores`
- `PUT /api/colaboradores/{id}`
- `DELETE /api/colaboradores/{id}`

O delete e logico: muda `ativo` para `false`, preservando historico.

### Carros

Listagem e detalhes: todos os cargos. Valores aparecem apenas para `GERENTE` ou superior.

- `GET /api/carros?busca=corolla&status=DISPONIVEL`
- `GET /api/carros/{id}`
- `POST /api/carros`
- `PUT /api/carros/{id}`
- `DELETE /api/carros/{id}`
- `POST /api/carros/{id}/fotos`
- `DELETE /api/carros/{carroId}/fotos/{fotoId}`

Para cadastro/edicao com fotos, use `multipart/form-data` com:

- `dados`: JSON do carro
- `fotos`: uma ou mais imagens

### Relatorios/Ocorrencias

- `GET /api/relatorios?status=PENDENTE`
- `GET /api/relatorios/contadores`
- `GET /api/relatorios/{id}`
- `POST /api/relatorios`
- `PATCH /api/relatorios/{id}/status`
- `POST /api/relatorios/{id}/resposta`
- `POST /api/relatorios/{id}/arquivar`

`COLABORADOR` ve apenas seus proprios relatorios. `GERENTE` ou superior ve todos. Apenas `DONO` responde e arquiva.

### Financeiro

Permissao: `GERENTE_FINANCEIRO` e `DONO`.

- `GET /api/financeiro/resumo`
- `GET /api/financeiro?tipo=ENTRADA`
- `POST /api/financeiro`

## Valores aceitos

- Cargo: `COLABORADOR`, `GERENTE`, `GERENTE_FINANCEIRO`, `DONO`
- Status do carro: `DISPONIVEL`, `VENDIDO`, `MANUTENCAO`
- Prioridade: `BAIXA`, `MEDIA`, `ALTA`, `URGENTE`
- Status do relatorio: `PENDENTE`, `EM_ANALISE`, `RESOLVIDO`, `ARQUIVADO`
- Tipo financeiro: `ENTRADA`, `SAIDA`
