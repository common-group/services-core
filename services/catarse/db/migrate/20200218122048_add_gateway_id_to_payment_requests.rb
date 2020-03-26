class AddGatewayIdToPaymentRequests < ActiveRecord::Migration
  def change
    add_column :payment_requests, :gateway_id, :string, foreign_key: false
    add_column :payment_requests, :gateway, :string
    add_index :payment_requests, %i[gateway gateway_id], unique: true
  end
end
