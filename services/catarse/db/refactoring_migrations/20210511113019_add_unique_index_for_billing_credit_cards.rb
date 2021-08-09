class AddUniqueIndexForBillingCreditCards < ActiveRecord::Migration[6.1]
  def change
    add_index :billing_credit_cards,
      %i[user_id gateway gateway_id],
      unique: true,
      name: 'index_credit_card_user_gateway_gateway_id'
  end
end
