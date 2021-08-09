class CreateMembershipSubscriptions < ActiveRecord::Migration[6.1]
  def change
    create_table :membership_subscriptions, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :tier, null: false, foreign_key: { to_table: :membership_tiers}, type: :uuid
      t.references :billing_option, null: false, foreign_key: { to_table: :membership_billing_options }, type: :uuid
      t.integer :cadence_in_months, null: false
      t.string :state, null: false
      t.monetize :amount

      t.timestamps
    end

    add_index :membership_subscriptions,
      %i[user_id project_id],
      unique: true,
      name: 'idx_user_project_uniq'
  end
end
