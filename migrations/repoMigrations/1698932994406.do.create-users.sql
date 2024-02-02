-- 1698932994406.do.create-users.sql

CREATE TABLE users (
  "userId" SERIAL PRIMARY KEY,
  "roleId" INT NOT NULL,
  "salutation" VARCHAR(30) NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NULL,
  "email" VARCHAR(255) NULL,
  "mobile" VARCHAR(255) NULL,
  "gender" gender_enum NULL,
  "dob" DATE NULL,
  "secretHash" VARCHAR(255) NULL,
  "address" VARCHAR(255) NOT NULL,
  "city" VARCHAR(255) NOT NULL,
  "state" VARCHAR(255) NOT NULL,
  "country" VARCHAR(255) NOT NULL,
  "postalCode" VARCHAR(255) NOT NULL,
  "status" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NULL,
  "deletedAt" TIMESTAMPTZ NULL,
  "createdBy" INT NOT NULL,
  "updatedBy" INT NULL,
  "deletedBy" INT NULL,
   CONSTRAINT fk_users_role_id FOREIGN KEY("roleId")
   REFERENCES "roles" ("roleId")
   ON DELETE CASCADE
);
