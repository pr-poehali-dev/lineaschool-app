-- Update admin password
UPDATE t_p720035_lineaschool_app.users 
SET password = 'admin1' 
WHERE login = 'admin' AND role = 'admin';