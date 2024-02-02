-- 1699270737780.do.create-notification-services.sql

CREATE TABLE "notificationServices" (
    "notificationServiceId" SERIAL PRIMARY KEY,
    "service" VARCHAR(255) NOT NULL,
    "serviceType" VARCHAR(255) NOT NULL,
    "host" VARCHAR(255) NULL,
    "port" VARCHAR(255) NULL,
    "encryption" VARCHAR(255) NULL,
    "configuration" JSON NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT FALSE, 
    "status" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NULL,
    "deletedAt" TIMESTAMPTZ NULL,
    "createdBy" INT NOT NULL,
    "updatedBy" INT NULL,
    "deletedBy" INT NULL,
    CONSTRAINT fk_notifications_created_by FOREIGN KEY("createdBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_notifications_updated_by FOREIGN KEY("updatedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_notifications_deleted_by FOREIGN KEY("deletedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE
);
