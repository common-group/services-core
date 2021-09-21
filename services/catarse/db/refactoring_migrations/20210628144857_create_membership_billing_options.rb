class CreateMembershipBillingOptions < ActiveRecord::Migration[6.1]
  def change
    create_table :membership_billing_options do |t|
      t.references :tier, null: false, foreign_key: { on_delete: :cascade, to_table: :membership_tiers }
      t.integer :cadence_in_months, null: false
      t.monetize :amount
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end
  end
end
