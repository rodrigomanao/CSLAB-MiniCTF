SHELL := /bin/sh
PYTHON := $(if $(wildcard .venv/bin/python),.venv/bin/python,python3)

.PHONY: install dev frontend backend

install:
	npm install
	python3 -m venv .venv
	.venv/bin/python -m pip install -r backend/requirements.txt

dev:
	@trap 'kill 0' INT TERM EXIT; \
	$(PYTHON) -m uvicorn backend.app.main:app --reload --port 8000 & \
	npm run dev

frontend:
	npm run dev

backend:
	$(PYTHON) -m uvicorn backend.app.main:app --reload --port 8000
