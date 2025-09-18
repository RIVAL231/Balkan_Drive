-- Remove optimization indexes

DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_files_is_public;
DROP INDEX IF EXISTS idx_file_shares_shared_with;
DROP INDEX IF EXISTS idx_file_shares_shared_by;
DROP INDEX IF EXISTS idx_file_downloads_file_id;
DROP INDEX IF EXISTS idx_file_downloads_downloaded_by;
DROP INDEX IF EXISTS idx_files_owner_created;
DROP INDEX IF EXISTS idx_files_folder_created;