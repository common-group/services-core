-- This file should undo anything in `up.sql`

delete from pg_enum where enumlabel = 'canceling';
