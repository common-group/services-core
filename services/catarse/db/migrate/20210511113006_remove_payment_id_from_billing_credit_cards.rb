class RemovePaymentIdFromBillingCreditCards < ActiveRecord::Migration[6.1]
  def change
    remove_reference :billing_credit_cards,
      :payment,
      null: false,
      foreign_key: { to_table: :billing_payments },
      type: :uuid
  end
end
