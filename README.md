# Blog Starter

A minimal full-stack blog starter with a Next.js + TypeScript frontend and a FastAPI backend.

## Structure

- `frontend/` - Next.js TypeScript app
  - `app/Home/` - home page
  - `app/News/` - news and articles page
  - `app/AboutUs/` - about the laboratory page
  - `public/articles/` - article photos
  - `public/articles/authors/` - author photos
  - `public/logos/` - logos and branding assets
- `backend/` - Python API powered by FastAPI

## Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run the frontend

In a second terminal:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Next.js proxies `/api` requests to `http://localhost:8000`.
