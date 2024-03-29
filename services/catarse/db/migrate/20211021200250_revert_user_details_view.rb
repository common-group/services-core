class RevertUserDetailsView < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL
    CREATE OR REPLACE VIEW "1".user_details
    AS SELECT u.id,
        u.common_id,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN ''::character varying(255)::text
                ELSE u.name
            END AS name,
        u.deactivated_at,
        thumbnail_image(u.*) AS profile_img_thumbnail,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN ''::character varying(255)
                ELSE u.facebook_link
            END AS facebook_link,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN ''::character varying(255)
                ELSE u.twitter
            END AS twitter_username,
            CASE
                WHEN is_owner_or_admin(u.id) THEN row_to_json(add.*)
                ELSE NULL::json
            END AS address,
            CASE
                WHEN is_owner_or_admin(u.id) THEN u.email
                ELSE NULL::text
            END AS email,
        COALESCE(ut.total_contributed_projects, 0::bigint) AS total_contributed_projects,
        COALESCE(ut.total_published_projects, 0::bigint) AS total_published_projects,
        ( SELECT json_agg(links.*) AS json_agg
               FROM ( SELECT ul.id,
                        ul.link
                       FROM user_links ul
                      WHERE ul.user_id = u.id) links) AS links,
        ( SELECT count(*) AS count
               FROM user_follows uf
              WHERE uf.user_id = u.id) AS follows_count,
        ( SELECT count(*) AS count
               FROM user_follows uf
              WHERE uf.follow_id = u.id) AS followers_count,
            CASE
                WHEN is_owner_or_admin(u.id) THEN u.cpf
                ELSE NULL::text
            END AS owner_document,
        cover_image_url(u.*) AS profile_cover_image,
        u.created_at,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN NULL::text
                ELSE u.about_html
            END AS about_html,
        is_owner_or_admin(u.id) AS is_owner_or_admin,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN false
                ELSE u.newsletter
            END AS newsletter,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN false
                ELSE u.subscribed_to_project_posts
            END AS subscribed_to_project_posts,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN false
                ELSE u.subscribed_to_new_followers
            END AS subscribed_to_new_followers,
            CASE
                WHEN u.deactivated_at IS NOT NULL AND NOT is_owner_or_admin(u.id) THEN false
                ELSE u.subscribed_to_friends_contributions
            END AS subscribed_to_friends_contributions,
        "current_user"() = 'admin'::name AS is_admin,
        u.permalink,
            CASE
                WHEN is_owner_or_admin(u.id) THEN email_active(u.*)
                ELSE NULL::boolean
            END AS email_active,
        u.public_name,
            CASE
                WHEN "current_user"() = 'anonymous'::name THEN false
                ELSE user_following_this_user(current_user_id(), u.id)
            END AS following_this_user,
            CASE
                WHEN is_owner_or_admin(u.id) THEN u.state_inscription
                ELSE NULL::character varying
            END AS state_inscription,
            CASE
                WHEN is_owner_or_admin(u.id) THEN u.birth_date
                ELSE NULL::date
            END AS birth_date,
            CASE
                WHEN is_owner_or_admin(u.id) THEN u.account_type
                ELSE NULL::text
            END AS account_type,
        "current_user"() = 'admin'::name AS is_admin_role,
            CASE
                WHEN is_owner_or_admin(u.id) THEN json_agg(json_build_object('user_marketing_list_id', mmu.id, 'marketing_list', row_to_json(mml.*)))
                ELSE NULL::json
            END AS mail_marketing_lists
       FROM users u
         LEFT JOIN "1".user_totals ut ON ut.id = u.id
         LEFT JOIN addresses add ON add.id = u.address_id
         LEFT JOIN mail_marketing_users mmu ON mmu.user_id = u.id
         LEFT JOIN mail_marketing_lists mml ON mml.id = mmu.mail_marketing_list_id
      GROUP BY u.id, add.*, ut.total_contributed_projects, ut.total_published_projects;
    SQL
  end

  def down
    execute <<-SQL
    CREATE OR REPLACE VIEW "1"."user_details" AS
      SELECT u.id,
          u.common_id,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN (''::character varying(255))::text
                  ELSE coalesce(u.public_name, u.name)
              END AS name,
          u.deactivated_at,
          thumbnail_image(u.*) AS profile_img_thumbnail,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN ''::character varying(255)
                  ELSE u.facebook_link
              END AS facebook_link,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN ''::character varying(255)
                  ELSE u.twitter
              END AS twitter_username,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN row_to_json(add.*)
                  ELSE NULL::json
              END AS address,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN u.email
                  ELSE NULL::text
              END AS email,
          COALESCE(ut.total_contributed_projects, (0)::bigint) AS total_contributed_projects,
          COALESCE(ut.total_published_projects, (0)::bigint) AS total_published_projects,
          ( SELECT json_agg(links.*) AS json_agg
                FROM ( SELECT ul.id,
                          ul.link
                        FROM user_links ul
                        WHERE (ul.user_id = u.id)) links) AS links,
          ( SELECT count(*) AS count
                FROM user_follows uf
                WHERE (uf.user_id = u.id)) AS follows_count,
          ( SELECT count(*) AS count
                FROM user_follows uf
                WHERE (uf.follow_id = u.id)) AS followers_count,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN u.cpf
                  ELSE NULL::text
              END AS owner_document,
          cover_image_url(u.*) AS profile_cover_image,
          u.created_at,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN NULL::text
                  ELSE u.about_html
              END AS about_html,
          is_owner_or_admin(u.id) AS is_owner_or_admin,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN false
                  ELSE u.newsletter
              END AS newsletter,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN false
                  ELSE u.subscribed_to_project_posts
              END AS subscribed_to_project_posts,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN false
                  ELSE u.subscribed_to_new_followers
              END AS subscribed_to_new_followers,
              CASE
                  WHEN ((u.deactivated_at IS NOT NULL) AND (NOT is_owner_or_admin(u.id))) THEN false
                  ELSE u.subscribed_to_friends_contributions
              END AS subscribed_to_friends_contributions,
          ("current_user"() = 'admin'::name) AS is_admin,
          u.permalink,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN email_active(u.*)
                  ELSE NULL::boolean
              END AS email_active,
          u.public_name,
              CASE
                  WHEN ("current_user"() = 'anonymous'::name) THEN false
                  ELSE user_following_this_user(current_user_id(), u.id)
              END AS following_this_user,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN u.state_inscription
                  ELSE NULL::character varying
              END AS state_inscription,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN u.birth_date
                  ELSE NULL::date
              END AS birth_date,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN u.account_type
                  ELSE NULL::text
              END AS account_type,
          ("current_user"() = 'admin'::name) AS is_admin_role,
              CASE
                  WHEN is_owner_or_admin(u.id) THEN json_agg(json_build_object('user_marketing_list_id', mmu.id, 'marketing_list', row_to_json(mml.*)))
                  ELSE NULL::json
              END AS mail_marketing_lists
        FROM ((((users u
          LEFT JOIN "1".user_totals ut ON ((ut.id = u.id)))
          LEFT JOIN addresses add ON ((add.id = u.address_id)))
          LEFT JOIN mail_marketing_users mmu ON ((mmu.user_id = u.id)))
          LEFT JOIN mail_marketing_lists mml ON ((mml.id = mmu.mail_marketing_list_id)))
        GROUP BY u.id, add.*, ut.total_contributed_projects, ut.total_published_projects;
    SQL
  end
end
