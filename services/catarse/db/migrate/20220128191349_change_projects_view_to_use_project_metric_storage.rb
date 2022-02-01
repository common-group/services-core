class ChangeProjectsViewToUseProjectMetricStorage < ActiveRecord::Migration[6.1]
  def change
    execute <<-SQL
    DROP VIEW "1".projects CASCADE;

    create or replace view "1".projects as
            SELECT p.id AS project_id,
    p.category_id,
    p.name AS project_name,
    p.headline,
    p.permalink,
    p.mode,
    p.state::text AS state,
    so.so AS state_order,
    od.od AS online_date,
    p.recommended,
    thumbnail_image(p.*, 'large'::text) AS project_img,
    remaining_time_json(p.*) AS remaining_time,
    p.expires_at,
    COALESCE(( SELECT
      CASE
          WHEN p.mode = 'sub'::text THEN ( SELECT sum(((s_1.checkout_data ->> 'amount'::text)::numeric) / 100::numeric) AS sum
             FROM common_schema.subscriptions s_1
            WHERE s_1.project_id = p.common_id AND s_1.status::text = 'active'::text)
          ELSE ( SELECT
                  CASE
                      WHEN p.state::text = 'failed'::text THEN
                      ((SELECT COALESCE((pms.data ->> 'pledged'::text)::numeric, 0) FROM project_metric_storages pms
                      WHERE  pms.project_id = p.id) UNION (SELECT 0::numeric) LIMIT 1)
                      ELSE
                      ((SELECT COALESCE((pms.data ->> 'paid_pledged'::text)::numeric, 0) FROM project_metric_storages pms
                      WHERE  pms.project_id = p.id) UNION (SELECT 0::numeric) LIMIT 1)
                  END AS paid_pledged
             FROM "1".project_totals pt
            WHERE pt.project_id = p.id)
      END AS paid_pledged), 0::numeric) AS pledged,
    COALESCE(( SELECT
                CASE
                    WHEN p.mode = 'sub'::text THEN (( SELECT sum(((s_1.checkout_data ->> 'amount'::text)::numeric) / 100::numeric) AS sum
                       FROM common_schema.subscriptions s_1
                      WHERE s_1.project_id = p.common_id AND s_1.status::text = 'active'::text)) / COALESCE(( SELECT min(g.value)
                       FROM goals g
                      WHERE g.project_id = p.id AND g.value > (select sum from ( SELECT sum(((s_2.checkout_data ->> 'amount'::text)::numeric) / 100::numeric) AS sum
                               FROM common_schema.subscriptions s_2
                              WHERE s_2.project_id = p.common_id AND s_2.status::text = 'active'::text) total_amount)
                     LIMIT 1), ( SELECT max(goals.value) AS max
                       FROM goals
                      WHERE goals.project_id = p.id)) * 100::numeric
                    ELSE (( SELECT COALESCE((pms.data ->> 'progress'::text)::numeric, 0) FROM project_metric_storages pms
                    WHERE  pms.project_id = p.id) UNION (SELECT 0::numeric) LIMIT 1)
                END AS progress), 0::numeric) AS progress,
    s.acronym AS state_acronym,
    u.name AS owner_name,
    c.name AS city_name,
    p.full_text_index,
    is_current_and_online(p.expires_at, p.state::text) AS open_for_contributions,
    elapsed_time_json(p.*) AS elapsed_time,
    score(p.*) AS score,
    (EXISTS ( SELECT true AS bool
           FROM contributions c_1
             JOIN user_follows uf ON uf.follow_id = c_1.user_id
          WHERE is_confirmed(c_1.*) AND uf.user_id = current_user_id() AND c_1.project_id = p.id)) AS contributed_by_friends,
    p.user_id AS project_user_id,
    p.video_embed_url,
    p.updated_at,
    u.public_name AS owner_public_name,
    zone_timestamp(p.expires_at) AS zone_expires_at
   FROM projects p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN cities c ON c.id = p.city_id
     LEFT JOIN states s ON s.id = c.state_id
     JOIN LATERAL zone_timestamp(online_at(p.*)) od(od) ON true
     JOIN LATERAL state_order(p.*) so(so) ON true;

    grant select on "1"."projects" to admin, anonymous, web_user;

    CREATE OR REPLACE FUNCTION public.near_me("1".projects)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    AS $function$
      SELECT
        COALESCE($1.state_acronym, (SELECT u.address_state FROM users u WHERE u.id = $1.project_user_id)) = (SELECT u.address_state FROM users u WHERE u.id = current_user_id());
    $function$;

    CREATE OR REPLACE FUNCTION public.is_expired(project projects)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    AS $function$
      select
      case when $1.mode = 'sub' then
        false
      else
        public.is_past($1.expires_at)
      end;
    $function$;

    CREATE OR REPLACE FUNCTION public.is_expired(project "1".projects)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    AS $function$
      select
      case when $1.mode = 'sub' then
          false
      else
        public.is_past($1.expires_at)
      end;
    $function$;

    CREATE OR REPLACE FUNCTION "1".project_search(query text)
    RETURNS SETOF "1".projects
    LANGUAGE sql
    STABLE
    AS $function$
      SELECT
        p.*
      FROM
          "1".projects p
      WHERE
          (
              p.full_text_index @@ plainto_tsquery('portuguese', unaccent(query))
              OR
              p.project_name % query
          )
          AND p.state_order >= 'published'
      ORDER BY
          p.open_for_contributions DESC,
          p.score DESC NULLS LAST,
          p.state DESC,
          ts_rank(p.full_text_index, plainto_tsquery('portuguese', unaccent(query))) DESC,
          p.project_id DESC;
    $function$;

    SQL
  end
end
