-- Your SQL goes here
create or replace view payment_service_api.credit_cards as
select
card.id,
card.user_id,
card.gateway,
(card.gateway_data ->> 'id' is not null) as in_gateway,
(
	case current_role
	when 'platform_user' then card.gateway_data
	else (card.gateway_data - 'id' - 'object' - 'date_created' - 'date_updated' - 'fingerprint')  
	end
) as gateway_data,
(
	case current_role
	when 'platform_user' then card.data
	else null end
	) as data,
	card.created_at
	from payment_service.credit_cards card
	where card.platform_id = core.current_platform_id() and (
		case current_role
		when 'platform_user' then true
		else card.user_id = core.current_user_id() end);
grant select on payment_service.credit_cards to platform_user, scoped_user;
grant select on payment_service_api.credit_cards to platform_user, scoped_user;