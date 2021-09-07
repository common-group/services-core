class CreateMembershipSubscriptions < ActiveRecord::Migration[6.1]
  def change
    create_table :membership_subscriptions do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.references :user, null: false, foreign_key: { on_delete: :restrict }
      t.references :tier, null: false, foreign_key: { on_delete: :restrict, to_table: :membership_tiers}
      t.references :billing_option,
        null: false,
        foreign_key: { on_delete: :restrict, to_table: :membership_billing_options }
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
