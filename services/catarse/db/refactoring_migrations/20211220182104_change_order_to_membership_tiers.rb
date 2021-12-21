class ChangeOrderToMembershipTiers < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:membership_tiers, :order, nil)
  end
end
