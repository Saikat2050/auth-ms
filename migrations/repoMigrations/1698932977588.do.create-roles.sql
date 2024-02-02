-- 1698932977588.do.create-roles.sql

CREATE TABLE "roles" (
  "roleId" SERIAL PRIMARY KEY,
  "slug" VARCHAR(50) NOT NULL UNIQUE,
  "title" VARCHAR(100) NOT NULL,
  "status" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NULL,
  "deletedAt" TIMESTAMPTZ NULL,
  "createdBy" INT NOT NULL,
  "updatedBy" INT NULL,
  "deletedBy" INT NULL
);