-- 1698935242190.do.create-auth-credentials.sql

CREATE TABLE "authCredentials" (
    "credentialId" SERIAL PRIMARY KEY,
	"userId" BIGINT NOT NULL,
    "userName" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NULL,
    "lastActivatedOn" VARCHAR(255) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NULL,
    "deletedAt" TIMESTAMPTZ NULL,
    "createdBy" INT NOT NULL,
    "updatedBy" INT NULL,
    "deletedBy" INT NULL,
    CONSTRAINT fk_auth_credentials_user_id FOREIGN KEY("userId")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_auth_credentials_created_by FOREIGN KEY("createdBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_auth_credentials_updated_by FOREIGN KEY("updatedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_auth_credentials_deleted_by FOREIGN KEY("deletedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE
);
