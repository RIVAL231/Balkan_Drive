CREATE TABLE content (
  sha256 TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  ref_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);
