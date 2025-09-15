CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  filehash TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filetype TEXT NOT NULL,
  filesize BIGINT NOT NULL,
  count INT DEFAULT 1,
  is_public BOOLEAN DEFAULT FALSE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID NULL, -- future: link to folders
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_hash ON files(filehash);
