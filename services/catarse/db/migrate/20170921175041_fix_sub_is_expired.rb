class FixSubIsExpired < ActiveRecord::Migration[4.2]
  def change
    execute <<-SQL
CREATE OR REPLACE FUNCTION is_expired(project "1".projects) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
            select
            case when $1.mode = 'aon' then
               public.is_past($1.expires_at)
            when $1.mode = 'sub' then
               false
            else
              public.is_past($1.expires_at) OR current_timestamp > $1.online_date + '365 days'::interval
            end;
        $_$;


CREATE OR REPLACE FUNCTION is_expired(project projects) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
            select
            case when $1.mode = 'aon' then
               public.is_past($1.expires_at)
            when $1.mode = 'sub' then
               false
            else
              public.is_past($1.expires_at) OR current_timestamp > $1.online_at + '365 days'::interval
            end;
        $_$;
    SQL
  end
end
