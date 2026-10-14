# Vitare — monitoramento staff

Aplicação React + Vite separada da PWA do paciente. É uma aplicação web convencional: não possui `manifest.json`, não registra Service Worker e não depende de instalação no dispositivo.

Em produção local, ela é montada em `/monitoramento/`. O `BrowserRouter` usa esse basename para manter as rotas internas independentes do restante do frontend.

Entrada principal:

```text
/monitoramento/
```

O entrypoint consulta o backend para decidir entre:

- `/monitoramento/cadastro`, somente se não existir nenhum staff;
- `/monitoramento/login`, se o bootstrap já estiver conclu�do;
- `/monitoramento/emergencias`, se houver sessão válida.

As áreas operacionais são protegidas também pelo backend através de `StaffJwtAuthGuard`.