-- 1699334078834.do.create-verifications.sql

CREATE TABLE "userVerifications" (
    "verificationId" SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "value" VARCHAR(150) NULL,
	"otp" TEXT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "status" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NULL,
    "deletedAt" TIMESTAMPTZ NULL,
    "createdBy" INT NOT NULL,
    "updatedBy" INT NULL,
    "deletedBy" INT NULL,
    CONSTRAINT fk_verifications_user_id FOREIGN KEY("userId")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_verifications_created_by FOREIGN KEY("createdBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_verifications_updated_by FOREIGN KEY("updatedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_verifications_deleted_by FOREIGN KEY("deletedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE
);
