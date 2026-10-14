# Vitare 2026 — Infraestrutura

A infraestrutura foi separada em duas camadas:

- `local/`: desenvolvimento, teste em LAN e operação local já existente.
- `public/`: publicação de produção em `https://vitare.app.br` via Cloudflare Tunnel.

## Regra operacional

Não execute os dois stacks com os mesmos nomes/volumes. Os nomes dos recursos públicos possuem prefixo `vitare-public-`, portanto os stacks podem coexistir no mesmo host sem colisão de portas ou volumes.

O stack público não publica portas no host. O ingresso é exclusivamente:

`Cloudflare -> cloudflared -> Nginx -> API`

O PostgreSQL permanece na rede interna de dados.