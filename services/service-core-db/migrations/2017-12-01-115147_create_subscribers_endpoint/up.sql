-- Your SQL goes here

create or replace view project_service_api.subscribers as
select
u.id as id,
u.external_id as user_id,
u.external_id as user_external_id,
p.id as project_id,
p.external_id as project_external_id,
json_build_object('public_name', u.data ->> 'public_name'::text,
  'name', u.data ->> 'name'::text,
  'city', u.data ->'address'->>'city'::text,
  'state', u.data ->'address'->>'state'::text, 
  'total_contributed_projects', (select count(distinct project_id) from payment_service.catalog_payments cp where cp.user_id = u.id and status= 'paid' ),
  'total_published_projects', (select count(distinct id) from project_service.projects p where p.user_id = u.id )
) AS data
from payment_service.subscriptions s
join community_service.users u on s.user_id = u.id
join project_service.projects p on p.id = s.project_id
WHERE u.platform_id = core.current_platform_id()
group by u.id, p.id;

grant SELECT on project_service_api.subscribers to admin;
grant SELECT on project_service_api.subscribers to scoped_user;
grant SELECT on project_service_api.subscribers to anonymous;
