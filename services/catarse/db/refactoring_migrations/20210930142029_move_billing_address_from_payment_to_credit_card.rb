class MoveBillingAddressFromPaymentToCreditCard < ActiveRecord::Migration[6.1]
  def change
    remove_reference :billing_payments,
      :billing_address,
      null: false,
      foreign_key: { on_delete: :restrict, to_table: :common_addresses }

    remove_column :billing_payments, :credit_card_hash, :string

    add_reference :billing_credit_cards,
      :billing_address,
      null: false,
      foreign_key: { on_delete: :restrict, to_table: :common_addresses }
  end
end
