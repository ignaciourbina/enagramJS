# Makefile for enagramJS tooling

install:
	npm install

build:
	npm run build

start:
	npm run dev

lint:
	npm run lint || echo "No linter configured."

test:
	npm test || echo "No tests configured."

clean:
	rm -rf node_modules dist
