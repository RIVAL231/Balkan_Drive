-- Remove public sharing columns from files table
DROP INDEX IF EXISTS idx_files_is_public_shared;
ALTER TABLE files DROP COLUMN IF EXISTS public_share_enabled_by;
ALTER TABLE files DROP COLUMN IF EXISTS public_share_enabled_at;
ALTER TABLE files DROP COLUMN IF EXISTS is_public_shared;