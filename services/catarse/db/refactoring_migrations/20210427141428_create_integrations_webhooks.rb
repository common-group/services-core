class CreateIntegrationsWebhooks < ActiveRecord::Migration[6.1]
  def change
    create_table :integrations_webhooks do |t|
      t.string :provider, null: false
      t.jsonb :body, default: {}
      t.jsonb :headers, default: {}
      t.string :state, null: false

      t.timestamps
    end
  end
end
