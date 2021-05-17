class AddPaymentMethodFeeAndInstallmentsCountToBillingPayments < ActiveRecord::Migration[6.1]
  def change
    add_monetize :billing_payments, :payment_method_fee
    add_column :billing_payments, :installments_count, :integer, default: 1
    rename_column :billing_payments, :total_shipping_fee_cents, :shipping_fee_cents
    rename_column :billing_payments, :total_shipping_fee_currency, :shipping_fee_currency
  end
end
