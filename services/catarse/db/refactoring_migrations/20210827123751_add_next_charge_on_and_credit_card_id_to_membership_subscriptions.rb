class AddNextChargeOnAndCreditCardIdToMembershipSubscriptions < ActiveRecord::Migration[6.1]
  def change
    add_column :membership_subscriptions, :next_charge_on, :date
    add_column :membership_subscriptions, :payment_method, :string
    add_reference :membership_subscriptions,
      :credit_card,
      null: true,
      foreign_key: { to_table: :billing_credit_cards },
      type: :uuid
    add_reference :membership_subscriptions,
      :shipping_address,
      null: true,
      foreign_key: { to_table: :shared_addresses },
      type: :uuid
  end
end
