-- Remove unique constraint on username
ALTER TABLE users DROP CONSTRAINT IF EXISTS unique_username;