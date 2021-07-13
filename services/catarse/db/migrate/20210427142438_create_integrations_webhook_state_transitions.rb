class CreateIntegrationsWebhookStateTransitions < ActiveRecord::Migration[6.1]
  def change
    create_table :integrations_webhook_state_transitions, id: :uuid do |t|
      t.string :to_state, null: false
      t.jsonb :metadata, default: {}
      t.integer :sort_key, null: false
      t.references :webhook, null: false, foreign_key: { to_table: :integrations_webhooks }, type: :uuid
      t.boolean :most_recent, null: false

      t.timestamps
    end

    add_index(:integrations_webhook_state_transitions,
      %i(webhook_id sort_key),
      unique: true,
      name: 'index_webhook_state_transitions_parent_sort')
    add_index(:integrations_webhook_state_transitions,
      %i(webhook_id most_recent),
      unique: true,
      where: 'most_recent',
      name: 'index_webhook_state_transitions_parent_most_recent')
  end
end
