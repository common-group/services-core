class AddAccountTypeToBankAccountEndpoint < ActiveRecord::Migration[4.2]
  def change
    execute %Q{
CREATE OR REPLACE VIEW "1"."bank_accounts" AS
 SELECT ba.user_id,
    b.name AS bank_name,
    b.code AS bank_code,
    ba.account,
    ba.account_digit,
    ba.agency,
    ba.agency_digit,
    ba.owner_name,
    ba.owner_document,
    ba.created_at,
    ba.updated_at,
    ba.id AS bank_account_id,
    ba.bank_id,
    ba.account_type
   FROM (bank_accounts ba
     JOIN banks b ON ((b.id = ba.bank_id)))
  WHERE is_owner_or_admin(ba.user_id);
}
  end
end
