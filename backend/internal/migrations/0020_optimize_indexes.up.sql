-- Add missing indexes for performance optimization

-- Index on username for faster user lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index on files.is_public for public file queries
CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public) WHERE is_public = true;

-- Index on file_shares.shared_with for faster shared file lookups
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON file_shares(shared_with);

-- Index on file_shares.shared_by for faster queries of files shared by user
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by ON file_shares(shared_by);

-- Index on file_downloads for analytics queries
CREATE INDEX IF NOT EXISTS idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_downloaded_by ON file_downloads(downloaded_by);

-- Composite index for commonly queried combinations
CREATE INDEX IF NOT EXISTS idx_files_owner_created ON files(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_folder_created ON files(folder_id, created_at DESC);