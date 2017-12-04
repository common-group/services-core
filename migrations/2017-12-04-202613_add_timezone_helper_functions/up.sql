-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.zone_timestamp(timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE sql
 IMMUTABLE SECURITY DEFINER
AS $function$
    -- hardcoded timezone to use immutable function / index
        SELECT $1::timestamptz AT TIME ZONE 'America/Sao_Paulo';
      $function$
;

CREATE OR REPLACE FUNCTION core.zone_timestamp(timestamp without time zone, zone text)
 RETURNS timestamp without time zone
 LANGUAGE sql
 IMMUTABLE SECURITY DEFINER
AS $function$
    -- hardcoded timezone to use immutable function / index
        SELECT $1::timestamptz AT TIME ZONE zone::text;
      $function$
;

CREATE OR REPLACE FUNCTION core.weekdays_from(weekdays integer, from_ts timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE sql
 STABLE
AS $function$
        SELECT max(day) FROM (
          SELECT day
          FROM generate_series(from_ts, from_ts + '1 year'::interval, '1 day') day
          WHERE extract(dow from day) not in (0,6)
          ORDER BY day
          LIMIT (weekdays + 1)
        ) a;
        $function$
;