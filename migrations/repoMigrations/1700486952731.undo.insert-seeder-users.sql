-- 1700486952731.undo.insert-seeder-users.sql

DO $$
DECLARE 
	superAdminUserId INTEGER;

SELECT "userId"::integer as "userId"
INTO superAdminUserId 
FROM users
where "firstName" = 'Super Admin';

DELETE FROM "authCredentials"
WHERE "userId" = superAdminUserId;

DELETE FROM "userVerifications"
WHERE "userId" = superAdminUserId;

END;
$$

DELETE FROM "users"
WHERE "firstName" = 'Super Admin';