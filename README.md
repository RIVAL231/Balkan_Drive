
# Balkan Drive

---

## 1) Quick start (Docker)
From repo root (PowerShell):

```powershell
git clone https://github.com/RIVAL231/Balkan_Drive.git
cd Balkan_Drive
docker-compose up --build
```

Services:
- Backend GraphQL server: http://localhost:8080/query (Playground at `/`)
- Frontend app: http://localhost:3001

Ensure Docker Desktop is running.

---

## 2) Local development (no Docker)

Backend
```powershell
cd backend
# set env vars or copy .env
go run ./server.go
```
Configuration is via environment variables (see `backend/internal/config/config.go`):
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- PORT, JWT_SECRET
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET

Frontend
```powershell
cd frontend
npm ci
npm run dev
```

Build frontend for production:
```powershell
cd frontend
npm run build
```

---

## 3) Database schema (overview)
The DB is PostgreSQL. Key tables (from `backend/internal/migrations/*.up.sql`):

- `users` (id UUID PK, username, email UNIQUE, password, role, created_at)
- `content` (sha256 PK, storage_key, size_bytes, ref_count, created_at) — dedup store
- `folders` (id UUID PK, owner_id FK -> users, name, parent_id FK -> folders, created_at)
- `files` (id UUID PK, filename, filehash FK -> content(sha256), filetype, filesize, is_public, owner_id FK -> users, folder_id FK -> folders, created_at)
- `file_shares` (id UUID PK, file_id FK -> files, shared_with FK -> users, shared_by FK -> users, permission, expires_at, created_at)
- `file_downloads` (id UUID PK, file_id FK -> files, downloaded_by FK -> users, downloaded_at, ip_address, user_agent)
- `audit_logs` (id UUID PK, user_id FK -> users, action, resource_type, resource_id, resource_name, details JSONB, ip_address INET, user_agent, created_at)

Indexes: users.username, files.owner_id, files.folder_id, files.is_public, file_shares.shared_with, file_downloads.file_id, and several composite indexes for queries and analytics.

ER notes:
- `content` stores unique file blobs (sha256 primary key). `files.filehash` references `content.sha256`.
- `folders` support nested parent-child via `parent_id`.

---

## 4) API surface

GraphQL (main entry): `POST /query` — schema in `backend/graph/schema.graphqls`.

Highlights (types & operations):
- Types: `User`, `File`, `Folder`, `Content`, `FileShares`, `PublicFile`, `AuditLog`, `UploadIntent`.
- Auth: `register`, `login` mutations returning `AuthPayload { token, user }`.
- File ops: `uploadFile` (multipart Upload), `completeUpload`, `deleteFile`, `changeVisibility`, `moveFile`.
- Sharing: `shareFile`, `shareFileByUsername`, `unshareFile`, public share mutations.
- Queries: `me`, `listFiles(folderId)`, `getFile(fileId)`, `searchFiles(...)`, `listPublicFiles`, `getFileDownloadStats(fileId)`.


GraphQL SDL is authoritative: see `backend/graph/schema.graphqls` for full types and arguments.

---

## 5) Runtime & env
- Default server port: `PORT` (default 8080)
- DB connection built from `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Storage: S3-compatible via AWS env vars; local dev may use a mock or local S3.

---

## 6) Architecture 

- API layer: GraphQL server implemented with `gqlgen` (backend/graph). It enforces types and resolves to DB and storage actions.
- DB layer: PostgreSQL. `content` table deduplicates file blobs; `files` references `content`.
- Storage: S3-compatible for blob storage; metadata in DB.
- Auth: JWT-based (see `internal/config` and `middleware/auth.go`).
- Middleware: rate limiter (`internal/middleware/ratelimit.go`), auth middleware (`internal/middleware/auth.go`), and audit logging (`internal/audit`).

Design trade-offs:
- GraphQL simplifies client queries and aggregated responses (search facets, stats) at cost of resolver complexity.
- Content-addressed storage reduces duplicate storage but requires careful reference counting (`content.ref_count`).

---

## 7) Where to look (important files)

- `backend/server.go` — server bootstrap, middlewares, GraphQL handler
- `backend/graph/schema.graphqls` — full GraphQL SDL (authoritative API)
- `backend/graph/resolver.go` — DB connection and resolver structure
- `backend/internal/migrations` — migration SQL files (schema reference)
- `backend/internal/config/config.go` — env variables and defaults
- `frontend/src/lib/apollo.ts` — Apollo client setup
- `frontend/src` — components and pages



## 8) Libraries (short list)

Backend
- `github.com/99designs/gqlgen` (GraphQL)
- `github.com/jackc/pgx/v5/pgxpool` (Postgres client)
- `github.com/joho/godotenv` (.env loader)
- `github.com/vektah/gqlparser/v2` (GraphQL parsing)
- `golang-migrate/migrate` (migrations)

Frontend
- `react`, `react-dom`, `vite`
- `@apollo/client`, `apollo-upload-client`
- `react-router-dom`, `react-hot-toast`
- `tailwindcss`, `postcss`

---



