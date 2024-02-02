-- 1698935603356.undo.insert-seeder-roles.sql

DELETE FROM "roles"
WHERE "slug" IN ('super-admin', 'admin');
