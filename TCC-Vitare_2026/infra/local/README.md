# Vitare — infraestrutura local e portátil

A infraestrutura coloca o TCC em uma topologia de produção local: Nginx é a única camada publicada, a API NestJS e o PostgreSQL ficam em redes internas e o banco é persistido em volume nomeado.

## Aplicações web

O monorepo agora possui duas aplicações frontend independentes:

- `apps/web`: interface do paciente, com manifest e Service Worker (PWA).
- `apps/web-staff`: interface convencional de monitoramento, sem manifest e sem Service Worker, montada em `/monitoramento/`.

O Nginx entrega:

```text
/                     -> web paciente
/monitoramento/        -> web staff
/api/                  -> NestJS
```

A página `/monitoramento` é normalizada para `/monitoramento/`. Dentro do módulo staff, `/monitoramento/` decide entre cadastro inicial, login ou painel, consultando o backend.

A aplicação staff é web convencional e não declara manifest nem registra Service Worker. Como ela permanece sob a mesma origem da aplicação paciente, a separação é de aplicação/escopo de recursos; isolamento absoluto do contexto de PWA do navegador exige publicar o staff em um subdom�nio separado.

## API same-origin

O frontend usa `/api/v1` em vez de `localhost:3000`. Isso elimina a dependência do endereço da máquina hospedeira para uso em celulares e torna o mesmo build reutilizável em Linux, Windows e publicação pública.

## HTTPS e celular

Para teste na LAN, gere um certificado com `scripts/generate-certs.sh IP_DA_MAQUINA`. O certificado deve ser confiável no dispositivo móvel. Geolocation e Service Worker devem operar em contexto seguro.

## Subida

1. Copie `.env.example` para `.env.local`.
2. Ajuste senha, IP/hostname e secrets.
3. Gere os certificados.
4. Execute `docker compose --env-file .env.local -f compose.yaml up -d --build`.
5. Acesse `https://SEU_HOST/` para a PWA e `https://SEU_HOST/monitoramento/` para o staff.

## Migrações e persistência

A inicialização é `PostgreSQL saudável -> prisma migrate deploy -> API -> Nginx`. O banco é persistido no volume `vitare_pg_data`. Não use `docker compose down -v` enquanto quiser preservar dados.

## Publicação pela Internet

O Compose não incorpora credenciais de Cloudflare. Para Internet pública, mantenha o baseline e adicione um Cloudflare Tunnel no host Windows/Linux apontando para o Nginx HTTPS local. Isso separa a publicação externa da aplicação.

## Podman

A topologia permanece compat�vel com OCI/Compose. Em Linux, o mesmo conjunto pode ser executado com Podman Compose e posteriormente operacionalizado com Quadlet/systemd.