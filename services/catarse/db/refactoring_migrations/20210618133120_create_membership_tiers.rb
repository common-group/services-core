class CreateMembershipTiers < ActiveRecord::Migration[6.1]
  def change
    create_table :membership_tiers do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false, limit: 512
      t.text :description, null: false
      t.text :thumbnail
      t.integer :subscribers_limit
      t.boolean :request_shipping_address, default: false, null: false
      t.integer :order, null: false, default: 0

      t.timestamps
    end
  end
end
