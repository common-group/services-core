class FixCreatedAtToBalanceTransfersView < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL

    CREATE OR REPLACE VIEW "1"."balance_transfers" AS
    SELECT bt.id,
        bt.user_id,
        bt.project_id,
        bt.amount,
        bt.transfer_id as transfer_id,
        zone_timestamp(bt.created_at) AS created_at,
        transfer_limit_date(bt.*) AS transfer_limit_date,
        current_state(bt.*) AS state,
        btt.metadata AS last_transition_metadata,
        zone_timestamp(transferred_transition.created_at) AS transferred_at,
        (zone_timestamp(transferred_transition.created_at))::date AS transferred_date,
        (zone_timestamp(bt.created_at))::date AS created_date,
        bt.full_text_index,
        u.name AS user_name,
        u.public_name AS user_public_name,
        u.email AS user_email,
        CASE
            WHEN ("current_user"() = 'admin'::name) THEN bt.admin_notes
            ELSE NULL::text
        END AS admin_notes,
        bt.batch_id,
        btt.metadata->'data'->>'id' as transfeera_id
      FROM (((balance_transfers bt
        JOIN users u ON ((u.id = bt.user_id)))
        LEFT JOIN balance_transfer_transitions btt ON (((btt.balance_transfer_id = bt.id) AND btt.most_recent)))
        LEFT JOIN LATERAL ( SELECT btt1.id,
               btt1.to_state,
               btt1.metadata,
               btt1.sort_key,
               btt1.balance_transfer_id,
               btt1.most_recent,
               COALESCE((((btt1.metadata -> 'transfer_data'::text) ->> 'date_created'::text))::timestamp without time zone, btt1.created_at) AS created_at,
               btt1.updated_at
              FROM balance_transfer_transitions btt1
             WHERE ((btt1.balance_transfer_id = bt.id) AND ((btt1.to_state)::text = 'transferred'::text))
             ORDER BY btt1.id DESC
            LIMIT 1) transferred_transition ON (true))
     WHERE is_owner_or_admin(bt.user_id);

    SQL
  end

  def down
    execute <<-SQL

    drop view "1".balance_transfers;

    CREATE OR REPLACE VIEW "1"."balance_transfers" AS
    SELECT bt.id,
        bt.user_id,
        bt.project_id,
        bt.amount,
        bt.transfer_id as transfer_id,
        zone_timestamp(bt.created_at) AS created_at,
        transfer_limit_date(bt.*) AS transfer_limit_date,
        current_state(bt.*) AS state,
        btt.metadata AS last_transition_metadata,
        zone_timestamp(transferred_transition.created_at) AS transferred_at,
        (zone_timestamp(transferred_transition.created_at))::date AS transferred_date,
        (zone_timestamp(bt.created_at))::date AS created_date,
        bt.full_text_index,
        u.name AS user_name,
        u.public_name AS user_public_name,
        u.email AS user_email,
        CASE
            WHEN ("current_user"() = 'admin'::name) THEN bt.admin_notes
            ELSE NULL::text
        END AS admin_notes,
        bt.batch_id,
        btt.metadata->'data'->>'id' as transfeera_id
      FROM (((balance_transfers bt
        JOIN users u ON ((u.id = bt.user_id)))
        LEFT JOIN balance_transfer_transitions btt ON (((btt.balance_transfer_id = bt.id) AND btt.most_recent)))
        LEFT JOIN LATERAL ( SELECT btt1.id,
               btt1.to_state,
               btt1.metadata,
               btt1.sort_key,
               btt1.balance_transfer_id,
               btt1.most_recent,
               coalesce((to_timestamp(((btt1.metadata -> 'transfer_data'::text) ->> 'date_created'::text), 'YYYY-MM-DD HH24:MI:SS'::text))::timestamp without time zone, btt1.created_at::timestamp without time zone) AS created_at,
               btt1.updated_at
              FROM balance_transfer_transitions btt1
             WHERE ((btt1.balance_transfer_id = bt.id) AND ((btt1.to_state)::text = 'transferred'::text))
             ORDER BY btt1.id DESC
            LIMIT 1) transferred_transition ON (true))
     WHERE is_owner_or_admin(bt.user_id);

    SQL
  end
end
