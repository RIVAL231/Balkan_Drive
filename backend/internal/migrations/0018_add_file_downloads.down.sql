-- Remove file_downloads table
DROP INDEX IF EXISTS idx_file_downloads_downloaded_at;
DROP INDEX IF EXISTS idx_file_downloads_downloaded_by;
DROP INDEX IF EXISTS idx_file_downloads_file_id;
DROP TABLE IF EXISTS file_downloads;