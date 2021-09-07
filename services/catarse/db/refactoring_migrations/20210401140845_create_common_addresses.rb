class CreateCommonAddresses < ActiveRecord::Migration[6.1]
  def change
    create_table :common_addresses do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }

      t.string :country_code, null: false, limit: 2
      t.string :postal_code, limit: 256
      t.string :line_1, null: false, limit: 512
      t.string :line_2, limit: 512
      t.string :number, limit: 64
      t.string :neighborhood, limit: 128
      t.string :city, null: false, limit: 256
      t.string :state, null: false, limit: 256
      t.string :phone_number, limit: 64
      t.string :first_name, limit: 128
      t.string :last_name, limit: 128
      t.string :organization, limit: 128

      t.timestamps
    end
  end
end
