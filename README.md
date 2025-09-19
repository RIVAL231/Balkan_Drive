# Balkan Drive — Quick Start


## RUN LOCALLY DOCKER COMPOSE
From repo root:

```powershell
docker-compose up --build
```

This builds and starts both backend and frontend services using `docker-compose.yml` at the repository root.

## Dev (local without docker)

Backend
```powershell
cd backend
go run ./server.go
# or build: go build -o backend .; .\backend
```

Frontend
```powershell
cd frontend
npm ci
npm run dev
# build: npm run build
```

## Useful commands

- Tail logs (Docker): `docker-compose logs -f`

## Important files

- `backend/server.go` — GraphQL server entry
- `backend/Dockerfile` — backend image
- `frontend/Dockerfile` — frontend image
- `docker-compose.yml` — run both services

## Libraries Used

Backend
- `github.com/99designs/gqlgen` — GraphQL server
- `github.com/jackc/pgx/v5/pgxpool` — Postgres DB client
- `github.com/joho/godotenv` — .env loader
- `github.com/vektah/gqlparser/v2` — GraphQL parsing
- `golang-migrate/migrate` (used in container) — DB migrations

Frontend
- `react`, `react-dom` — UI
- `@apollo/client` — GraphQL client
- `apollo-upload-client` — file uploads
- `react-router-dom` — routing
- `tailwindcss`, `postcss` — styling
- `vite` — dev server / build

