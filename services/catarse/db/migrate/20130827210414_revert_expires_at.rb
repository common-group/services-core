class RevertExpiresAt < ActiveRecord::Migration[4.2]
  def up
    execute "
    CREATE OR REPLACE FUNCTION expires_at(projects) RETURNS timestamptz AS $$
     SELECT (((($1.online_date AT TIME ZONE coalesce((SELECT value FROM configurations WHERE name = 'timezone'), 'America/Sao_Paulo') + ($1.online_days || ' days')::interval)  )::date::text || ' 23:59:59-03')::timestamptz )
    $$ LANGUAGE SQL;
    "
  end

  def down
  end
end
