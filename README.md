# CS-Lab Mini CTF

A cybersecurity laboratory blog and controlled training environment for CS-Lab activities, CTF events, and security learning.

## Project structure

```text
.
├── backend/
│   ├── app/main.py          # FastAPI API
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── Home/            # /
│   │   ├── News/            # /News
│   │   ├── AboutUs/         # /AboutUs
│   │   ├── login/           # /login
│   │   ├── register/        # /register
│   │   ├── dashboard/       # /dashboard
│   │   ├── admin-panel/     # /admin-panel
│   │   └── components/      # Shared navigation and article components
│   └── public/              # Article and CISUC images
├── Makefile
└── package.json
```

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer
- `pip`

## Install

From the project root:

```bash
make install
```

This creates `.venv` and installs the backend dependencies there. The Makefile uses that environment automatically, so you do not need to activate it manually.

## Run the project

Start the frontend and backend together:

```bash
make dev
```

Open the website at [http://localhost:3000](http://localhost:3000).

The API is available at [http://localhost:8000](http://localhost:8000). The health endpoint is:

```text
http://localhost:8000/api/health
```

To run either service separately:

```bash
make frontend
make backend
```

The frontend proxies `/api/*` requests to the FastAPI server on port `8000`. If the backend is not running, Next.js logs `ECONNREFUSED` and the API-backed content cannot be loaded.

### Docker

To run the project for the first time:

```bash
docker compose up --build
```

**Important:** this `docker-compose.yml` does not mount the code as volumes.
Each service (`frontend`, `backend`) copies the code into the image at build
time. This means that **every time you change code** (`.py`, `.tsx`, etc.),
you need to rebuild the image for the change to take effect:

```bash
docker compose up -d --build
```

Running `docker compose restart` alone is **not enough**. It restarts the
process, but keeps running the old code baked into the same image.

To follow logs in real time (useful for catching backend/frontend errors):

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

To reset everything from scratch, including wiping the database data
(recreates the schema from `database/schema.sql`):

```bash
docker compose down -v
docker compose up --build
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/Home` | Upcoming events and latest news |
| `/News` | Full article listing and search |
| `/AboutUs` | CS-Lab information |
| `/login` | Login interface |
| `/register` | Account registration interface |
| `/dashboard` | Authenticated user dashboard |
| `/admin-panel` | Restricted administrator workspace |

After a successful login, normal users are redirected to `/dashboard`. Users with the `admin` role are redirected to `/admin-panel`. The frontend keeps the profile and the access token in browser storage, but the restricted areas are now decided by the API: `/admin-panel` is only rendered when the API confirms that the token belongs to an administrator.

## Database setup

The backend uses PostgreSQL through direct parameterized SQL with `psycopg`. Copy the example environment file and replace the password with the one configured for your local `postgres` user:

```bash
cp .env.example .env
```

For the EDB PostgreSQL installer used in the course, `.env` should contain a value like:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/cslab
```

If your password contains URL characters such as `@`, encode them in the URL. For example, `Rodrigo@2212` becomes:

```env
DATABASE_URL=postgresql://postgres:Rodrigo%402212@localhost:5432/cslab
```

Do not commit `.env`; it is ignored by Git.

Install the Python dependencies, create the tables and seed the training users, then start the backend:

```bash
make install
psql -d cslab -U postgres -f database/schema.sql
make backend
```

The SQL script creates the `users` table and seeds three fictional accounts. The `super-admin` account has `id=1`, which is useful for the controlled IDOR exercise. The seed passwords are `AdminPass123!`, `TrainingPass123!` and `StudentPass123!`, respectively; change them before sharing the isolated environment.

The script is idempotent, so it is safe to run it again over an existing
database. It adds the `access_token` column with `ALTER TABLE ... ADD COLUMN IF
NOT EXISTS`, which is what a database created before access tokens existed
needs.

The authentication endpoints are:

```text
POST /api/auth/register
POST /api/auth/login
```

You can test them with Postman or with the frontend forms. New passwords are stored as Argon2 hashes; they are never stored as plain text. The API queries use `%s` parameters rather than string interpolation.

## Access tokens

Both `/api/auth/register` and `/api/auth/login` generate a new opaque access
token (`secrets.token_urlsafe`), write it to `users.access_token` and return it
in the `access_token` field of the response. Every login rotates the token, so
only the most recent one stays valid.

The frontend keeps the token in `localStorage` under `cslab-auth-session` and
sends it as a bearer header:

```text
GET /api/user?id=2
Authorization: Bearer <access_token>
```

Requests without a valid token get `401`. `GET /api/admin/me` returns `403`
unless the token belongs to an account with the `admin` role.

## Training exercise: IDOR on the dashboard

`GET /api/user` is **intentionally vulnerable** and must stay that way while the
exercise is active. It checks that a valid token was sent, but then resolves
the profile from the `id` query parameter instead of from the token, and it
returns the access token of the account it looked up.

That gives participants the two intended paths to the admin panel:

1. **Burp match and replace** — intercept the dashboard request and change
   `?id=2` to `?id=1`. The response contains the `super-admin` profile and its
   access token.
2. **Local storage swap** — replace the `accessToken` in the
   `cslab-auth-session` local storage entry with the token captured above and
   open `/admin-panel`.

Do not "fix" `get_user_by_id` in `backend/app/main.py` while the event is
running, and do not log in as `super-admin` during the event: logging in
rotates its token and invalidates any token participants already captured. The
token for the seeded `super-admin` is in `database/schema.sql`; the ones for
`training-user` and `student-user` rotate on their first login.

The repository also includes a REST Client request file at `requests/cslab-api.rest`. Install the VS Code **REST Client** extension and use the `Send Request` link above each request to test the API directly from the editor.

## Development notes

- Do not commit `frontend/.next/`; it is generated by Next.js and is ignored by Git.
- Article and logo assets belong in `frontend/public/`.
- Keep the CTF environment isolated and use fictional accounts and data.
