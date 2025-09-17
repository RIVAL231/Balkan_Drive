-- Create file_downloads table to track download statistics
CREATE TABLE file_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    downloaded_by UUID REFERENCES users(id),
    downloaded_at TIMESTAMP DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX idx_file_downloads_downloaded_by ON file_downloads(downloaded_by);
CREATE INDEX idx_file_downloads_downloaded_at ON file_downloads(downloaded_at);