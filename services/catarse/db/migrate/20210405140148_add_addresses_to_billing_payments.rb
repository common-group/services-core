class AddAddressesToBillingPayments < ActiveRecord::Migration[6.1]
  def change
    add_reference :billing_payments,
      :billing_address,
      null: false,
      foreign_key: { to_table: :shared_addresses },
      type: :uuid

    add_reference :billing_payments,
      :shipping_address,
      foreign_key: { to_table: :shared_addresses },
      type: :uuid
  end
end
