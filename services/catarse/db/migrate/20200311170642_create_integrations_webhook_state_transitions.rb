class CreateIntegrationsWebhookStateTransitions < ActiveRecord::Migration
  def change
    create_table :webhook_state_transitions, id: :uuid do |t|
      t.references :webhook, null: false, index: true, foreign_key: true, type: :uuid, index: true
      t.string :from_state
      t.string :to_state, null: false
      t.string :event
      t.string :description
      t.json :metadata, default: '{}'

      t.timestamps null: false
    end
  end
end
