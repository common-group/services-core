class CreateBillingBankSlips < ActiveRecord::Migration
  def change
    create_table :bank_slips, id: :uuid do |t|
      t.references :payment_request, null: false, index: true, foreign_key: true, type: :uuid
      t.string :gateway, null: false
      t.string :barcode, null: false
      t.string :url, null: false
      t.date :expires_on, null: false
      t.json :metadata, default: '{}'

      t.timestamps null: false
    end
  end
end
