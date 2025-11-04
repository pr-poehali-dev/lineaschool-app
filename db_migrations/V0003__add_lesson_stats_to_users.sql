ALTER TABLE t_p720035_lineaschool_app.users 
ADD COLUMN lessons_attended INTEGER DEFAULT 0,
ADD COLUMN lessons_missed INTEGER DEFAULT 0,
ADD COLUMN lessons_paid INTEGER DEFAULT 0;