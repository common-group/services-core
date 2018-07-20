-- Your SQL goes here
ALTER TABLE project_service.reports DROP COLUMN IF EXISTS platform_id;
ALTER TABLE project_service.posts DROP COLUMN IF EXISTS platform_id;
ALTER TABLE project_service.reminders DROP COLUMN IF EXISTS platform_id;
ALTER TABLE project_service.goals DROP COLUMN IF EXISTS platform_id;
