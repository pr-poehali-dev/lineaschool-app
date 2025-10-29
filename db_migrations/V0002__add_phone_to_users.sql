-- Add phone column to users table
ALTER TABLE t_p720035_lineaschool_app.users 
ADD COLUMN phone VARCHAR(20) UNIQUE;

-- Add index on phone for faster lookups
CREATE INDEX idx_users_phone ON t_p720035_lineaschool_app.users(phone);