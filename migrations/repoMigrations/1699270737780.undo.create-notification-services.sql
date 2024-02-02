-- 1699270737780.undo.create-notification-services.sql

ALTER TABLE "notificationServices" 
DROP CONSTRAINT fk_notificationservices_created_by,
DROP CONSTRAINT fk_notificationservices_updated_by,
DROP CONSTRAINT fk_notificationservices_deleted_by;

DROP TABLE "notificationServices";
