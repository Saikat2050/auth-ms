-- 1698932994406.undo.create-users.sql

ALTER TABLE "users" 
DROP CONSTRAINT fk_users_role_id;

DROP TABLE "users";
