class AddZoneExpiresAtToProjectDetails < ActiveRecord::Migration[4.2]
  def up
    execute <<-SQL
      create function public.settings(name text)
      returns text
      language sql
      stable
      security definer as $$
        SELECT value FROM settings WHERE name = $1;
      $$;
      create function public.zone_expires_at(projects)
      returns timestamp
      language sql
      stable
      security definer as $$
        SELECT $1.expires_at::timestamptz AT TIME ZONE settings('timezone');
      $$;
      drop view "1".project_details;
      create view "1".project_details as
        select
          p.id as project_id,
          coalesce(pt.progress, 0) as progress,
          coalesce(pt.pledged, 0) as pledged,
          coalesce(pt.total_contributions, 0) as total_contributions,
          p.state,
          p.expires_at,
          p.zone_expires_at,
          p.online_date,
          p.sent_to_analysis_at,
          p.is_published,
          p.is_expired,
          p.open_for_contributions,
          p.remaining_time_json as remaining_time,
          (
            select
              json_build_object('id', u.id, 'name', u.name)
            from users u where u.id = p.user_id
          ) as user,
          json_agg(DISTINCT rd.*) as rewards,
          count(DISTINCT pn.*) filter (where pn.template_name = 'reminder') as reminder_count
        from projects p
        left join "1".project_totals pt on pt.project_id = p.id
        left join "1".reward_details rd on rd.project_id = p.id
        left join public.project_notifications pn on pn.project_id = p.id
        group by
          p.id,
          pt.progress,
          pt.pledged,
          pt.total_contributions,
          p.state,
          p.expires_at,
          p.sent_to_analysis_at,
          pt.total_payment_service_fee;

      grant select on "1".project_details to admin;
      grant select on "1".project_details to web_user;
      grant select on "1".project_details to anonymous;
    SQL
  end

  def down
    execute <<-SQL
      drop view "1".project_details;
      drop function public.settings(name text);
      drop function public.zone_expires_at(projects);
      create view "1".project_details as
        select
          p.id as project_id,
          coalesce(pt.progress, 0) as progress,
          coalesce(pt.pledged, 0) as pledged,
          coalesce(pt.total_contributions, 0) as total_contributions,
          p.state,
          p.expires_at,
          p.online_date,
          p.sent_to_analysis_at,
          p.is_published,
          p.is_expired,
          p.open_for_contributions,
          p.remaining_time_json as remaining_time,
          (
            select
              json_build_object('id', u.id, 'name', u.name)
            from users u where u.id = p.user_id
          ) as user,
          json_agg(DISTINCT rd.*) as rewards,
          count(DISTINCT pn.*) filter (where pn.template_name = 'reminder') as reminder_count
        from projects p
        left join "1".project_totals pt on pt.project_id = p.id
        left join "1".reward_details rd on rd.project_id = p.id
        left join public.project_notifications pn on pn.project_id = p.id
        group by
          p.id,
          pt.progress,
          pt.pledged,
          pt.total_contributions,
          p.state,
          p.expires_at,
          p.sent_to_analysis_at,
          pt.total_payment_service_fee;

      grant select on "1".project_details to admin;
      grant select on "1".project_details to web_user;
      grant select on "1".project_details to anonymous;
    SQL
  end

end
