CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  filehash TEXT NOT NULL REFERENCES content(sha256) ON DELETE CASCADE,
  filetype TEXT NOT NULL,
  filesize BIGINT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID NULL REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_folder ON files(folder_id);
