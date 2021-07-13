class CreateBillingPaymentItemStateTransitions < ActiveRecord::Migration[6.1]
  def change
    create_table :billing_payment_item_state_transitions, id: :uuid do |t|
      t.string :to_state, null: false
      t.jsonb :metadata, default: {}
      t.integer :sort_key, null: false
      t.references :payment_item, null: false, foreign_key: { to_table: :billing_payment_items }, type: :uuid
      t.boolean :most_recent, null: false

      t.timestamps null: false
    end

    add_index(:billing_payment_item_state_transitions,
              %i[payment_item_id sort_key],
              unique: true,
              name: "index_payment_item_state_transitions_parent_sort")
    add_index(:billing_payment_item_state_transitions,
              %i[payment_item_id most_recent],
              unique: true,
              where: "most_recent",
              name: "index_payment_item_state_transitions_parent_most_recent")
  end
end
