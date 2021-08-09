class CreateMembershipSubscriptionStateTransitions < ActiveRecord::Migration[6.1]
  def change
    create_table :membership_subscription_state_transitions, id: :uuid do |t|
      t.string :to_state, null: false
      t.jsonb :metadata, default: {}
      t.integer :sort_key, null: false
      t.references :subscription,
        null: false,
        foreign_key: { to_table: :membership_subscriptions },
        type: :uuid,
        index: { name: 'idx_membership_sub_state_transitions_sub_id'}
      t.boolean :most_recent, null: false

      t.timestamps
    end

    add_index(:membership_subscription_state_transitions,
              %i[subscription_id sort_key],
              unique: true,
              name: "idx_membership_sub_state_transitions_parent_sort")
    add_index(:membership_subscription_state_transitions,
              %i[subscription_id most_recent],
              unique: true,
              where: "most_recent",
              name: "idx_membership_sub_state_transitions_parent_most_recent")
  end
end
