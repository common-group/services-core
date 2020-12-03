class ShowRefundedOnBackersReport < ActiveRecord::Migration[4.2]
  def up
    execute <<-SQL
      CREATE OR REPLACE VIEW backer_reports AS
      SELECT
        b.project_id,
        u.name,
        b.value,
        r.minimum_value,
        r.description,
        b.payment_method,
        b.payment_choice,
        b.payment_service_fee,
        b.key,
        b.created_at::date,
        b.confirmed_at::date,
        u.email,
        b.payer_email,
        b.payer_name,
        coalesce(b.payer_document, u.cpf) as cpf,
        u.address_street,
        u.address_complement,
        u.address_number,
        u.address_neighbourhood,
        u.address_city,
        u.address_state,
        u.address_zip_code,
        b.state
      FROM
        backers b
        JOIN users u ON u.id = b.user_id
        LEFT JOIN rewards r ON r.id = b.reward_id
      WHERE
        b.state IN ('confirmed', 'refunded', 'requested_refund');
    SQL
  end

  def down
    execute <<-SQL
      CREATE OR REPLACE VIEW backer_reports AS
      SELECT
        b.project_id,
        u.name,
        b.value,
        r.minimum_value,
        r.description,
        b.payment_method,
        b.payment_choice,
        b.payment_service_fee,
        b.key,
        b.created_at::date,
        b.confirmed_at::date,
        u.email,
        b.payer_email,
        b.payer_name,
        coalesce(b.payer_document, u.cpf) as cpf,
        u.address_street,
        u.address_complement,
        u.address_number,
        u.address_neighbourhood,
        u.address_city,
        u.address_state,
        u.address_zip_code,
        b.requested_refund,
        b.refunded
      FROM
        backers b
        JOIN users u ON u.id = b.user_id
        LEFT JOIN rewards r ON r.id = b.reward_id
      WHERE
        b.state IN ('confirmed', 'refunded', 'requested_refund')
    SQL
  end
end
