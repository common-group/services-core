class AddCreditCardIdAndCreditCardHashToBillingPayments < ActiveRecord::Migration[6.1]
  def change
    add_reference :billing_payments,
      :credit_card,
      foreign_key: { on_delete: :restrict, to_table: :billing_credit_cards }
    add_column :billing_payments, :credit_card_hash, :string
  end
end
