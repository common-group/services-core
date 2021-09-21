class AddAddressesToBillingPayments < ActiveRecord::Migration[6.1]
  def change
    add_reference :billing_payments,
      :billing_address,
      null: false,
      foreign_key: { on_delete: :restrict, to_table: :common_addresses }

    add_reference :billing_payments,
      :shipping_address,
      foreign_key: { on_delete: :restrict, to_table: :common_addresses }
  end
end
