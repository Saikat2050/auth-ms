-- 1700486952731.do.insert-seeder-users.sql

DO $$
DECLARE 
	superAdminRoleId INTEGER;
	superAdminUserId INTEGER;

BEGIN
SELECT "roleId"::integer as "roleId"
INTO superAdminRoleId 
FROM roles
where slug = 'super-admin';

INSERT INTO "users" ("roleId", "firstName", "accountApprovalStatus", "createdBy") 
VALUES (superAdminRoleId, 'Super Admin', 'completed', 1);

SELECT "userId"::integer as "userId"
INTO superAdminUserId 
FROM users
where "firstName" = 'Super Admin';

INSERT INTO "authCredentials" ("userId", "userName", "password", "createdBy") 
VALUES (superAdminUserId, 'super.admin@mailinator.com', '$2b$10$Y832/0XxZ7832Q5y4qNrAO3oaB9oKNjyg/LuA4eDdQup7YBKyk6My', superAdminUserId),
(superAdminUserId, '0000000001', '$2b$10$Y832/0XxZ7832Q5y4qNrAO3oaB9oKNjyg/LuA4eDdQup7YBKyk6My', superAdminUserId);

INSERT INTO "userVerifications" ("userId", "value", "isVerified", "createdBy") 
VALUES (superAdminUserId, 'super.admin@mailinator.com', true, superAdminUserId),
(superAdminUserId, '0000000001', true, superAdminUserId);

END;
$$