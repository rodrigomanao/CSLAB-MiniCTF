SHELL := /bin/sh

.PHONY: install dev frontend backend

install:
	npm install
	python3 -m pip install -r backend/requirements.txt

dev:
	@trap 'kill 0' INT TERM EXIT; \
	uvicorn backend.app.main:app --reload --port 8000 & \
	npm run dev

frontend:
	npm run dev

backend:
	uvicorn backend.app.main:app --reload --port 8000
