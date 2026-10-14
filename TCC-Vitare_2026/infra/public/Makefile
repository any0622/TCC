COMPOSE=docker compose --env-file .env.public -f compose.yaml

config:
	$(COMPOSE) config

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=200

logs-tunnel:
	$(COMPOSE) logs -f --tail=200 cloudflared

logs-api:
	$(COMPOSE) logs -f --tail=200 api

restart:
	$(COMPOSE) restart

build:
	$(COMPOSE) build --pull

pull:
	$(COMPOSE) pull