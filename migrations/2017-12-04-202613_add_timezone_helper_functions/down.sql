-- This file should undo anything in `up.sql`
DROP FUNCTION core.zone_timestamp(timestamp without time zone);
DROP FUNCTION core.zone_timestamp(timestamp without time zone, zone text);

DROP FUNCTION core.weekdays_from(weekdays integer, from_ts timestamp without time zone)