# Balkan Drive - System Architecture & Design

## Executive Summary

Balkan Drive is a secure, scalable file storage system built with modern web technologies. The system implements a content-addressed storage architecture with GraphQL API, providing deduplication, hierarchical organization, and comprehensive sharing capabilities.

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React js      │    │   Go Backend    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (GraphQL)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   AWS S3        │
                        │  (Blob Storage) │
                        └─────────────────┘
```

### Technology Stack

**Frontend (React.js)**
- **Framework**: React 18 with TypeScript
- **State Management**: Apollo Client with InMemoryCache
- **Routing**: React Router DOM
- **Styling**: TailwindCSS with custom components
- **Build Tool**: Vite with hot module replacement
- **API Integration**: Apollo GraphQL Client with file upload support

**Backend (Go Microservice)**
- **Framework**: Go 1.21+ with net/http
- **GraphQL**: gqlgen for schema-first development
- **Database**: PostgreSQL with pgx/v5 driver
- **Authentication**: JWT with RS256 signing
- **Storage**: AWS S3
- **Middleware**: Rate limiting, authentication, CORS, audit logging

**Infrastructure**
- **Database**: PostgreSQL 14 
- **Storage**: AWS S3
- **Containerization**: Docker
- **Orchestration**: Docker Compose for development

## Core Design Principles

### 1. Content-Addressed Storage (CAS)

**Problem**: Traditional file storage creates duplicates, wasting space and bandwidth.

**Solution**: Content deduplication using SHA256 hashing.

```
File Upload Flow:
1. Calculate SHA256 hash of file content
2. Check if content exists in `content` table
3. If exists: Link file metadata to existing content
4. If new: Store blob in S3, create content record
5. Create file metadata record with hash reference
```

**Benefits**:
- 60-80% storage savings for typical enterprise workloads
- Faster uploads for duplicate content
- Integrity verification through cryptographic hashing
- Atomic reference counting for safe garbage collection

### 2. Hierarchical Folder Structure

**Design**: Self-referencing folder tree with UUID identifiers.

```sql
CREATE TABLE folders (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    parent_id UUID REFERENCES folders(id), -- NULL = root level
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Features**:
- Unlimited nesting depth
- Efficient tree traversal with recursive CTEs
- Path resolution caching for performance
- Atomic move operations

### 3. Secure File Sharing

**Multi-level sharing model**:

1. **Private**: Owner-only access (default)
2. **User Sharing**: Explicit permission grants to specific users
3. **Public Sharing**: Share with all users, the file is available to all users of the system.

**Security Features**:
- Revocation capabilities

### 4. Comprehensive Audit Logging

**Compliance-first design** for enterprise security requirements:

```go
type AuditLog struct {
    ID           uuid.UUID       `json:"id"`
    UserID       *uuid.UUID      `json:"user_id"`       // NULL for public access
    Action       string          `json:"action"`        // login, upload, download, etc.
    ResourceType string          `json:"resource_type"` // file, folder, user
    ResourceID   *uuid.UUID      `json:"resource_id"`
    ResourceName *string         `json:"resource_name"`
    Details      json.RawMessage `json:"details"`       // Structured metadata
    IPAddress    net.IP          `json:"ip_address"` //Future addition
    UserAgent    string          `json:"user_agent"`
    CreatedAt    time.Time       `json:"created_at"`
}
```

## Data Flow Architecture

### 1. File Upload Process

```
[Client] → [Frontend] → [Backend] → [Database] → [S3]
    │          │            │           │          │
    │          │            ├─ Hash calculation
    │          │            ├─ Deduplication check
    │          │            ├─ Metadata creation
    │          │            └─ Audit logging
    │          │
    │          └─ Progress tracking
    │             Chunk upload
    │             Error handling
    │
    └─ File selection
       Metadata extraction
      
```

**Key Components**:

1. **Frontend Upload**:
   - Progress indication with Apollo's subscriptions
   - Drag-and-drop interface with validation
   - Client-side MIME type detection

2. **Backend Processing**:
   - Multipart form handling
   - SHA256 hash computation
   - Atomic database transactions
   - S3 pre-signed URL generation

3. **Storage Layer**:
   - Content-addressed blob storage
   - Metadata separation for fast queries
   - Reference counting for cleanup

### 2. File Download Process

```
[Client Request] → [Authentication] → [Authorization] → [S3 Pre-signed URL] → [Direct Download]
                        │                   │                    │
                        ├─ JWT validation   ├─ Permission check  └─ Time-limited access
                        └─ User context     └─ Audit logging        
```

**Security Layers**:
- JWT token validation
- File ownership verification
- Share permission checking
- Download activity logging

### 3. Search and Discovery

**Multi-dimensional search**:

1. **Filename Search**: Full-text search with PostgreSQL's `tsvector`
2. **Metadata Filtering**: Size, type, date ranges
3. **Content-Type Grouping**: Documents, images, videos, etc.
4. **Folder Scoping**: Search within specific directory trees
5. **Sharing Status**: Public, private, shared files

**Performance Optimizations**:
- Composite indexes on frequently queried columns

## Security Architecture

### 1. Authentication & Authorization

**JWT-based stateless authentication**:

```go
type Claims struct {
    UserID   uuid.UUID `json:"user_id"`
    Username string    `json:"username"`
    Role     string    `json:"role"`
    jwt.RegisteredClaims
}
```

**Role-Based Access Control (RBAC)**:
- **USER**: Standard file operations, personal sharing
- **ADMIN**: System administration, audit log access, user management

### 2. API Security

**Multiple protection layers**:

1. **Rate Limiting**: Token bucket algorithm per user/IP
2. **Input Validation**: GraphQL schema validation + custom rules
3. **SQL Injection Prevention**: Parameterized queries with pgx

### 3. Data Protection

**Encryption at Rest and in Transit**:
- JWT signing with RS256 (asymmetric keys)
- Password hashing with bcrypt (cost factor 12)

**Privacy Controls**:
- Data minimization in audit logs

## Performance Architecture

### 1. Database Optimization

**Index Strategy**:

```sql
-- Core performance indexes
CREATE INDEX CONCURRENTLY idx_files_owner_folder ON files(owner_id, folder_id);
CREATE INDEX CONCURRENTLY idx_files_public ON files(is_public) WHERE is_public = true;
CREATE INDEX CONCURRENTLY idx_file_shares_target ON file_shares(shared_with, expires_at);
CREATE INDEX CONCURRENTLY idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_content_ref_count ON content(ref_count) WHERE ref_count > 0;

-- Full-text search
CREATE INDEX CONCURRENTLY idx_files_filename_fts ON files USING gin(to_tsvector('english', filename));
```

**Connection Pooling**:
- pgxpool with 25 max connections
- Health checks and automatic reconnection
- Query timeout enforcement (30 seconds)

## Deployment Architecture

### 1. Development Environment

```yaml
# docker-compose.yml structure
services:
  backend:
    build: ./backend
    environment:
      - DB_HOST=postgres
    depends_on: [postgres]
  
  frontend:
    build: ./frontend
    ports: ["3001:80"]
    depends_on: [backend]
  
  postgres:
    image: postgres:14
    volumes: [postgres_data:/var/lib/postgresql/data]
  
```

## Quality Assurance

### 1. Code Quality

**Static Analysis**:
- Go: `golangci-lint` with security rules
- TypeScript: ESLint with strict type checking
- SQL: `sqlfluff` for query linting

**Documentation Standards**:
- GoDoc for all public functions and types
- JSDoc for complex TypeScript functions
- OpenAPI specification for API contracts
- Architecture decision records (ADRs)

## Business Logic & Domain Model

### 1. Core Entities

**User Domain**:
```go
type User struct {
    ID           uuid.UUID `json:"id"`
    Username     string    `json:"username"`
    Email        string    `json:"email"`
    Role         Role      `json:"role"`
    StorageQuota int64     `json:"storage_quota"`
    CreatedAt    time.Time `json:"created_at"`
}
```

**Content Domain**:
```go
type Content struct {
    SHA256     string    `json:"sha256"`      // Primary key
    StorageKey string    `json:"storage_key"` // S3 object key
    SizeBytes  int64     `json:"size_bytes"`
    RefCount   int32     `json:"ref_count"`   // Reference counting
    CreatedAt  time.Time `json:"created_at"`
}

type File struct {
    ID        uuid.UUID  `json:"id"`
    Filename  string     `json:"filename"`
    Filehash  string     `json:"filehash"`    // FK to Content.SHA256
    Filetype  string     `json:"filetype"`
    Filesize  int64      `json:"filesize"`
    IsPublic  bool       `json:"is_public"`
    OwnerID   uuid.UUID  `json:"owner_id"`
    FolderID  *uuid.UUID `json:"folder_id"`
    CreatedAt time.Time  `json:"created_at"`
}
```

### 2. Business Rules

**Storage Quotas**:
- Default: 10MB per user
- Enforcement at upload time
- Deduplication doesn't count against quota

**File Sharing**:
- Owner has full control (read/write/delete/share)
- Shared users get explicit permissions
- Public files are read-only
- Share expiration is enforced at access time

**Audit Requirements**:
- All file operations logged
- User authentication events tracked
- Admin actions require additional logging

## Future Enhancements

### 1. Planned Features

**Version Control**:
- File versioning with content-addressed snapshots
- Branch and merge capabilities for collaborative editing
- Diff visualization for text-based files

**Collaboration**:
- Real-time collaborative editing
- Comment and annotation systems
- Team workspaces with advanced permissions

### 2. Scalability Roadmap

**Performance Optimizations**:
- Read replicas for geographic distribution
- Caching layer with Redis Cluster
- Background job processing with message queues

## Conclusion

Balkan Drive implements a modern, secure, and scalable file storage architecture that addresses key challenges in enterprise data management:

