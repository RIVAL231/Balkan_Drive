-- Add unique constraint on username to prevent duplicate usernames
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);