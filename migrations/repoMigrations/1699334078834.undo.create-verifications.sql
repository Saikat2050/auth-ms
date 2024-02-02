-- 1699334078834.undo.create-verifications.sql

ALTER TABLE "userVerifications" 
DROP CONSTRAINT fk_verifications_user_id,
DROP CONSTRAINT fk_verifications_created_by,
DROP CONSTRAINT fk_verifications_updated_by,
DROP CONSTRAINT fk_verifications_deleted_by;

DROP TABLE "userVerifications";
