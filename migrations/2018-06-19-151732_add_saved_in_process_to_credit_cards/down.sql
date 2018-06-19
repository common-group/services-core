-- This file should undo anything in `up.sql`
alter table payment_service.credit_cards
    drop column saved_in_process;