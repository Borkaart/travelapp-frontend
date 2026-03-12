# Configuração do Railway (Backend e Frontend)

Este guia ajuda a configurar as variáveis de ambiente necessárias para corrigir os erros de deploy (502 no Frontend, Crash no Backend).

## 1. Backend (travelapp-spring-jwt)

### Erro Identificado
O backend falhava ao iniciar porque faltava a configuração de conexão com o Banco de Dados no `application.yml`.

### Ação Necessária (Manual)
Edite o arquivo `src/main/resources/application.yml` do **backend** e substitua todo o conteúdo pelo seguinte:

```yaml
spring:
  config:
    import: optional:file:.env[.properties]

  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:travelapp}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    open-in-view: true
    properties:
      hibernate:
        format_sql: true

server:
  port: ${PORT:8080}

jwt:
  secret: ${JWT_SECRET:WPvHbw1zGN9Rs8BZtup4igI5CTqrKAFLhdQJMl2xUVEfX6noSY37Ome0Dkaycj}
  expiration: ${JWT_EXPIRATION:14400000}
  refresh-expiration-days: ${JWT_REFRESH_EXPIRATION_DAYS:7}

app:
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS:http://localhost:5173}

geoapify:
  enabled: ${GEOAPIFY_ENABLED:false}
  api-key: ${GEOAPIFY_API_KEY:}
  base-url: ${GEOAPIFY_BASE_URL:https://api.geoapify.com}

unsplash:
  enabled: ${UNSPLASH_ENABLED:false}
  access-key: ${UNSPLASH_ACCESS_KEY:}
  base-url: ${UNSPLASH_BASE_URL:https://api.unsplash.com}

amadeus:
  enabled: ${AMADEUS_ENABLED:false}
  client-id: ${AMADEUS_CLIENT_ID:}
  client-secret: ${AMADEUS_CLIENT_SECRET:}
  base-url: ${AMADEUS_BASE_URL:https://test.api.amadeus.com}

---
spring:
  config:
    activate:
      on-profile: prod

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    open-in-view: false
    properties:
      hibernate:
        format_sql: false

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:14400000}
  refresh-expiration-days: ${JWT_REFRESH_EXPIRATION_DAYS:7}

springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

### Variáveis no Railway (Backend)
No painel do Railway, adicione as seguintes variáveis no serviço do **Backend**:

| Variável | Valor Exemplo | Descrição |
|----------|---------------|-----------|
| `DB_HOST` | `containers-us-west-1.railway.app` | Host do Postgres (pegue na aba Connect do banco) |
| `DB_PORT` | `6543` | Porta do Postgres |
| `DB_NAME` | `railway` | Nome do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `*******` | Senha do banco |
| `JWT_SECRET` | `(gere uma string longa aleatória)` | Segredo para assinar tokens |
| `APP_CORS_ALLOWED_ORIGINS` | `https://seu-frontend.up.railway.app` | URL do Frontend (sem barra no final) |

---

## 2. Frontend (travelapp-frontend)

### Erro Identificado (502 Bad Gateway)
O frontend tentava conectar em `localhost` porque `VITE_API_URL` não estava definida em produção.

### Variáveis no Railway (Frontend)
No painel do Railway, adicione a variável no serviço do **Frontend**:

| Variável | Valor Exemplo | Descrição |
|----------|---------------|-----------|
| `VITE_API_URL` | `https://seu-backend.up.railway.app/api` | URL do Backend + `/api` |

**Nota Importante**: Se o seu backend estiver rodando em `https://backend.railway.app`, a variável deve ser `https://backend.railway.app/api`.
