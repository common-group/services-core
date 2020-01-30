class CreatePaymentRequestTransitions < ActiveRecord::Migration
  def change
    create_table :payment_request_transitions, id: :uuid do |t|
      t.references :payment_request, null: false, foreign_key: true, type: :uuid
      t.string :from_state
      t.string :to_state, null: false
      t.json :metadata, default: '{}'

      t.timestamps null: false
    end
  end
end
