CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'read',
  expires_at TIMESTAMP NULL
);

CREATE UNIQUE INDEX idx_file_user_share ON file_shares(file_id, shared_with);
