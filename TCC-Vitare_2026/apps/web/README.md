# Vitare — interface do paciente

Esta aplicação é o frontend React + Vite destinado ao usuário/paciente. Ela é a única interface do monorepo que possui manifest e Service Worker PWA.

A API é consumida pela origem relativa `/api/v1`; no ambiente Docker/Nginx isso evita a dependência de `localhost:3000`.

O módulo de monitoramento não faz parte desta aplicação. Ele está em `apps/web-staff` e é entregue pelo Nginx em `/monitoramento/`.


## Cache offline do PWA

O PWA utiliza duas camadas distintas:

- **Cache Storage / Service Worker:** shell, navegação e assets estáticos. `/api/` e `/monitoramento/` ficam fora desse cache.
- **IndexedDB:** respostas estruturadas de leitura da área do paciente, como perfil, medicamentos, doenças crônicas, alergias, contatos e medicamentos proibidos. O conteúdo é separado por usuário, possui TTL e só é usado como fallback em falhas de rede.

As operações de escrita continuam online-first. O Vitare não transforma o botão de emergência em uma fila offline. Tokens de autenticação não são armazenados no IndexedDB.


## Rotas de saúde

As áreas `Medicamentos`, `Doenças Crônicas` e `Alergias` são rotas independentes no n�vel principal: `/medicamentos`, `/doencas-cronicas` e `/alergias`. `Minha Saúde` não é um segmento dessas URLs. Os antigos caminhos temporários `/minha-saude/doencas-cronicas` e `/minha-saude/alergias` continuam apenas como redirects de compatibilidade para as URLs canônicas.