IMAGE ?= chatting-website-node
PORT ?= 3000

.PHONY: setup run run-mongo test docker-build docker-run compose-up compose-down clean

setup: ## Install dependencies
	npm install

run: ## Run with the in-memory user store on http://localhost:$(PORT)
	USE_MOCKS=1 PORT=$(PORT) node server/server.js

run-mongo: ## Run against a local MongoDB on localhost:27017
	USE_MOCKS=0 PORT=$(PORT) node server/server.js

test:
	npx mocha server/**/*.test.js

docker-build:
	docker build -t $(IMAGE) .

docker-run: docker-build ## Run in Docker (mock store) on http://localhost:$(PORT)
	docker run --rm -p $(PORT):3000 $(IMAGE)

compose-up: ## App + real MongoDB
	docker compose up --build

compose-down:
	docker compose down

clean:
	rm -rf node_modules
