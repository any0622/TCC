# Notas de integração — Vitare

## 1. Frontends separados

`apps/web` é a PWA do paciente. `apps/web-staff` é a aplicação web convencional de monitoramento. Eles compartilham a API NestJS, mas possuem entrypoints, routers e HTML próprios.

## 2. API relativa

A URL de produção deve ser `/api/v1`. O Nginx encaminha `/api/` para o serviço `api:3000`.

## 3. PWA

O paciente possui `manifest.json` e `sw.js`. O Service Worker não intercepta `/api/` nem `/monitoramento/`. Dados cl�nicos e respostas administrativas não são colocados em cache pelo Service Worker.

## 4. Staff bootstrap

`GET /api/v1/staff/auth/setup-status` informa apenas se ainda não existe nenhum staff. Enquanto não houver staff, `/monitoramento/` encaminha para o cadastro inicial. Após a criação do primeiro staff, o endpoint de cadastro público fica bloqueado e o acesso passa a ser feito pelo login.

`GET /api/v1/staff/auth/me` valida a sessão existente. As rotas operacionais do staff continuam protegidas por `StaffJwtAuthGuard` no backend.

## 5. Banco

`PrismaService` aceita `POOLED_DATABASE_URL` e faz fallback para `DATABASE_URL`, permitindo um PostgreSQL local sem pooler.

## 6. Segurança

`STAFF_JWT_SECRET` faz parte da validação de boot. O frontend continua usando bearer token para esta entrega, mas a evolução recomendada para produção é migrar a sessão de browser para cookies HttpOnly/Secure com proteção CSRF adequada.