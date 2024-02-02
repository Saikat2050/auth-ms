-- 1702531949622.do.create-configs.sql

CREATE TABLE "configs" (
  "configId" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "status" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NULL,
  "deletedAt" TIMESTAMPTZ NULL,
  "createdBy" INT NOT NULL,
  "updatedBy" INT NULL,
  "deletedBy" INT NULL
);