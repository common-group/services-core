class CreateIntegrationsWebhooks < ActiveRecord::Migration
  def change
    create_table :webhooks, id: :uuid do |t|
      t.string :provider, null: false, index: true
      t.json :body, default: '{}'
      t.json :headers, default: '{}'
      t.string :state, null: false

      t.timestamps null: false
    end

    add_index :webhooks, %i[provider state created_at]
  end
end
