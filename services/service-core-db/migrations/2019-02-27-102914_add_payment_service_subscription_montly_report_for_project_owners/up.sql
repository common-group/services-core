-- Your SQL goes here
create or replace view payment_service.subscription_montly_report_for_project_owners as
  select
      cp.project_id as project_id,
      usr.data->>'name' as name,
      usr.data->>'public_name' as public_name,
      usr.data->>'email' as email,
      replace((round((((cp.data ->> 'amount'::text))::numeric / (100)::numeric), 2))::text, '.'::text, ','::text) AS amount,
      replace((round((((((cp.data ->> 'amount'::text))::numeric * (prj.data->>'service_fee')::decimal) / (100)::numeric) - fees.gateway_fee), 2))::text, '.'::text, ','::text) AS service_fee,
      replace((fees.gateway_fee)::text, '.'::text, ','::text) AS payment_method_fee,
      replace((round(((((cp.data ->> 'amount'::text))::numeric - (((cp.data ->> 'amount'::text))::numeric * (prj.data->>'service_fee')::decimal)) / (100)::numeric), 2))::text, '.'::text, ','::text) AS net_value,
      rwd.data->>'title' as title,
      rwd.data->>'description' as description,
      (cp.data ->> 'payment_method'::text) AS payment_method,
      core.zone_timestamp(cp.created_at) AS created_at,
      core.zone_timestamp(pst.created_at) AS paid_at,
      'Confirmado'::text AS confirmed,
      usr.id AS user_id,
      CASE
          WHEN COALESCE(((sub.checkout_data ->> 'anonymous'::text) = 'true'::text), ((cp.data ->> 'anonymous'::text) = 'true'::text)) THEN 'sim'::text
          ELSE 'não'::text
      END AS anonymous,
      user_address.street,
      user_address.complement,
      user_address.number,
      user_address.neighborhood,
      user_address.city,
      (user_address.state)::text AS state,
      user_address.zipcode,
      usr.data->>'document_number' as cpf
  from payment_service.catalog_payments cp
  join community_service.users usr on usr.id = cp.user_id
  left join project_service.rewards rwd on rwd.id = cp.reward_id
  join payment_service.payment_status_transitions pst on pst.catalog_payment_id = cp.id
    and pst.to_status = 'paid'::payment_service.payment_status
  left join payment_service.subscriptions sub on sub.id = cp.subscription_id
  join project_service.projects prj on prj.id = cp.project_id
  left join lateral ( select round((
    case
        when ((cp.gateway_general_data ->> 'gateway_payment_method'::text) = 'credit_card'::text)
          then (coalesce(((cp.gateway_general_data ->> 'gateway_cost'::text))::numeric, (0)::numeric) + coalesce(((cp.gateway_general_data ->> 'payable_total_fee'::text))::numeric, (0)::numeric))
        else (coalesce((cp.gateway_general_data ->> 'payable_total_fee'::text), (cp.gateway_general_data ->> 'gateway_cost'::text), '0'::text))::numeric
    end / (100)::numeric), 2) AS gateway_fee
  ) fees ON (true)
  left join lateral (
    select
      usr.data->'address'->>'street' as street,
      usr.data->'address'->>'complementary' as complement,
      usr.data->'address'->>'street_number' as number,
      usr.data->'address'->>'neighborhood' as neighborhood,
      usr.data->'address'->>'city' as city,
      usr.data->'address'->>'state' as state,
      usr.data->'address'->>'zipcode' as zipcode
  ) user_address ON (true)
  where cp.status = 'paid'
  group by
    user_address.street, user_address.complement, user_address.number, user_address.neighborhood, user_address.city, user_address.state, user_address.zipcode,
    prj.id, cp.gateway_general_data, cp.project_id, usr.data->>'name', usr.data->>'public_name', usr.email, cp.data, rwd.data->>'title', rwd.data->>'description', cp.created_at, cp.updated_at,
    usr.id, pst.created_at, sub.checkout_data, fees.gateway_fee;