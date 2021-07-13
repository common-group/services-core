class ChangeExpiresAtBillingPixes < ActiveRecord::Migration[6.1]
  def change
    rename_column :billing_pixes, :expires_at, :expires_on
    change_column :billing_pixes, :expires_on, :date
  end
end
