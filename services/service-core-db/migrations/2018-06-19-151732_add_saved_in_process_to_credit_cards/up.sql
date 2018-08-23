-- Your SQL goes here
alter table payment_service.credit_cards
    add column saved_in_process boolean default false;