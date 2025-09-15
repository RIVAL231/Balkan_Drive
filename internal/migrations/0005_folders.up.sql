CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID NULL REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- Prevent duplicate folder names under the same parent for one user
CREATE UNIQUE INDEX idx_folder_unique
  ON folders(owner_id, parent_id, name);
