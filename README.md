
# Balkan Drive

A secure file storage system with GraphQL API, built with Go backend and React frontend.

Access the deployed application at: [https://balkandrive.sankalpsharma.me](https://balkandrive.sankalpsharma.me)

## Quick Start

### Docker (Recommended)
```powershell
git clone https://github.com/RIVAL231/Balkan_Drive.git
cd Balkan_Drive
docker compose up
```

**Access Points:**
- **API Documentation**: http://localhost:8080/docs/
- **GraphQL Playground**: http://localhost:8080/ 
- **Frontend App**: http://localhost:3001
- **API Endpoint**: http://localhost:8080/query

## 📚 Documentation

### Complete Documentation Suite

**📖 API Documentation**
- **Interactive Schema**: http://localhost:8080/docs/ (SpectaQL-generated)
- **Postman Collection**: [`docs/postman-collection.json`](docs/postman-collection.json)
- **OpenAPI Specification**: [`docs/openapi.yaml`](docs/openapi.yaml)

**🏗️ Architecture & Design**
- **System Architecture**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Database Schema**: Detailed ER diagrams and relationships (see below)
- **Design Decisions**: Content-addressed storage, security model.

**💻 Code Documentation**
- **Backend**: Comprehensive GoDoc comments for all functions
- **Frontend**: TypeScript interfaces and JSDoc for complex functions
- **GraphQL Schema**: [`backend/graph/schema.graphqls`](backend/graph/schema.graphqls)

### Prerequisites

**Required Software:**
- **Docker & Docker Compose** (recommended)
- **Go 1.21+** (for local backend development)
- **Node.js 18+** (for local frontend development)
- **PostgreSQL 14** (for local database)


### Local Development
**Backend:**
```powershell
cd backend
go mod download
go run server.go
```

**Frontend:**
```powershell
cd frontend
npm ci
npm run dev
```
**Database:**
```powershell
cd backend
docker compose up
```

**Setting up Migrations**
```powershell
cd backend
cd internal
migrate -path migrations -database "postgres://admin:admin@localhost:5432/graphqlmvp?sslmode=disable" up
```
Note: Make sure you have `migrate` CLI tool installed. See [golang-migrate/migrate](https://github.com/golang-migrate/migrate)

**Environment Variables:**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (PostgreSQL)
- `PORT`, `JWT_SECRET` (Server config)
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET` (Storage)

## API Documentation

**Complete API Reference: http://localhost:8080/docs/**

Interactive documentation includes:
- All GraphQL mutations and queries with examples
- Complete type definitions and field descriptions
- Authentication requirements and user roles
- Real-time testing capabilities

## Database Schema

**PostgreSQL with content deduplication and hierarchical file organization:**

### Entity Relationship Overview
```
users (1) ←→ (N) files
users (1) ←→ (N) folders
users (1) ←→ (N) file_shares
users (1) ←→ (N) file_downloads
users (1) ←→ (N) audit_logs

content (1) ←→ (N) files (via SHA256 hash)
folders (1) ←→ (N) folders (self-referencing parent-child)
folders (1) ←→ (N) files
files (1) ←→ (N) file_shares
files (1) ←→ (N) file_downloads
```

### Table Definitions

**`users`** - User accounts and authentication
- `id` (UUID, PK) - Unique user identifier
- `username` (VARCHAR, UNIQUE) - Login username
- `email` (VARCHAR, UNIQUE) - User email address
- `password` (VARCHAR) - Hashed password
- `role` (ENUM) - User role (admin, user)
- `storage_quota` (BIGINT) - Storage limit in bytes
- `created_at` (TIMESTAMP) - Account creation time

**`content`** - Deduplicated blob storage (Content-Addressed Storage)
- `sha256` (VARCHAR, PK) - File content hash (primary key)
- `storage_key` (VARCHAR) - S3/storage reference key
- `size_bytes` (BIGINT) - File size in bytes
- `ref_count` (INTEGER) - Reference counter for garbage collection
- `created_at` (TIMESTAMP) - First upload time

**`folders`** - Hierarchical folder structure
- `id` (UUID, PK) - Unique folder identifier
- `name` (VARCHAR) - Folder display name
- `owner_id` (UUID, FK→users.id) - Folder owner
- `parent_id` (UUID, FK→folders.id, NULLABLE) - Parent folder (NULL = root)
- `created_at` (TIMESTAMP) - Folder creation time

**`files`** - File metadata and organization
- `id` (UUID, PK) - Unique file identifier
- `filename` (VARCHAR) - Original filename
- `filehash` (VARCHAR, FK→content.sha256) - Content reference
- `filetype` (VARCHAR) - MIME type
- `filesize` (BIGINT) - File size (denormalized from content)
- `is_public` (BOOLEAN) - Public accessibility flag
- `owner_id` (UUID, FK→users.id) - File owner
- `folder_id` (UUID, FK→folders.id, NULLABLE) - Parent folder
- `created_at` (TIMESTAMP) - Upload time

**`file_shares`** - File sharing permissions
- `id` (UUID, PK) - Unique share identifier
- `file_id` (UUID, FK→files.id) - Shared file
- `shared_with` (UUID, FK→users.id) - Target user
- `shared_by` (UUID, FK→users.id) - Sharing user
- `permission` (ENUM) - Access level (read, write)
- `expires_at` (TIMESTAMP, NULLABLE) - Share expiration
- `created_at` (TIMESTAMP) - Share creation time

**`file_downloads`** - Download analytics and tracking
- `id` (UUID, PK) - Unique download record
- `file_id` (UUID, FK→files.id) - Downloaded file
- `downloaded_by` (UUID, FK→users.id, NULLABLE) - User (NULL = public)
- `downloaded_at` (TIMESTAMP) - Download timestamp
- `ip_address` (INET) - Client IP address
- `user_agent` (TEXT) - Client user agent

**`audit_logs`** - Security and compliance logging
- `id` (UUID, PK) - Unique log entry
- `user_id` (UUID, FK→users.id, NULLABLE) - Acting user
- `action` (VARCHAR) - Action performed (login, upload, delete, etc.)
- `resource_type` (VARCHAR) - Resource type (file, folder, user)
- `resource_id` (UUID, NULLABLE) - Resource identifier
- `resource_name` (VARCHAR, NULLABLE) - Resource name for context
- `details` (JSONB, NULLABLE) - Additional structured data
- `ip_address` (INET) - Client IP address
- `user_agent` (TEXT) - Client user agent
- `created_at` (TIMESTAMP) - Action timestamp

### Key Design Features

**Content Deduplication**: Files with identical content share the same `content` record, reducing storage costs.

**Hierarchical Folders**: Self-referencing `parent_id` enables unlimited nesting depth.

**Soft References**: `files.filehash` → `content.sha256` with reference counting for safe cleanup.

**Comprehensive Auditing**: All user actions logged with structured details for compliance, which can be monitored via the admin login, for testing the user is given the choice to create account as an admin as well, in practice an admin account will be created by the system administrator.

**Performance Indexes**: Optimized for common queries (user files, folder contents, public files).

## Core Features

### Authentication & Security
- JWT-based authentication
- Role-based access control (Admin/User)
- Rate limiting and audit logging
- Secure file sharing with expiration

### File Management
- Upload/download with deduplication
- Folder organization with nesting
- Public and private file sharing
- Download analytics and statistics

### Admin Panel
- Logs for file uploads, downloads, deletions.
- Number of files, total downloads, top downloaded, number of public files, recent downloads.
- User management (view users in the system).



### API Features
- GraphQL with real-time queries
- File upload via multipart forms
- Search and filtering capabilities
- Comprehensive audit trails

## Architecture

- **API Layer**: GraphQL server with `gqlgen`
- **Database**: PostgreSQL with content deduplication
- **Storage**: AWS S3
- **Frontend**: React with Apollo GraphQL client
- **Security**: JWT authentication with middleware

## Key Files

### Backend
- `server.go` - Main server and middleware setup
- `graph/schema.graphqls` - Complete GraphQL schema
- `internal/migrations/` - Database schema migrations

### Documentation
- `public/index.html` - Generated API documentation (SpectaQL)

### Frontend
- `src/lib/apollo.ts` - GraphQL client configuration
- `src/components/` - React components

## Tech Stack

**Backend:** Go, GraphQL (gqlgen), PostgreSQL, AWS S3  
**Frontend:** React, TypeScript, Apollo Client, TailwindCSS, Vite  
**Documentation:** SpectaQL, OpenAPI 3.0, Postman Collections, GoDoc  
**DevOps:** Docker, Docker Compose 
---

All documentation artifacts are located in the [`docs/`](docs/) directory and linked throughout this README.
