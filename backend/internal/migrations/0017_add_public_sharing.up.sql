-- Add public sharing columns to files table
ALTER TABLE files ADD COLUMN is_public_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN public_share_enabled_at TIMESTAMP;
ALTER TABLE files ADD COLUMN public_share_enabled_by UUID REFERENCES users(id);

-- Create index for faster public file queries
CREATE INDEX idx_files_is_public_shared ON files(is_public_shared) WHERE is_public_shared = TRUE;