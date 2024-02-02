-- 1698935242190.undo.create-auth-credentials.sql

ALTER TABLE "authCredentials" 
DROP CONSTRAINT fk_auth_credentials_user_id,
DROP CONSTRAINT fk_auth_credentials_created_by,
DROP CONSTRAINT fk_auth_credentials_updated_by,
DROP CONSTRAINT fk_auth_credentials_deleted_by;

DROP TABLE "authCredentials";
