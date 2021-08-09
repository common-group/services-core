class ChangeExpiresAtBillingPixes < ActiveRecord::Migration[6.1]
  def up
    rename_column :billing_pixes, :expires_at, :expires_on
    change_column :billing_pixes, :expires_on, :date
  end

  def down
    rename_column :billing_pixes, :expires_on, :expires_at
    change_column :billing_pixes, :expires_at, :datetime
  end
end
