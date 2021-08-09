class AddAmountAndTotalShippingFeeToBillingPayments < ActiveRecord::Migration[6.1]
  def change
    add_monetize :billing_payments, :total_shipping_fee
    add_monetize :billing_payments, :amount
  end
end
