class CreatePaymentRequestStateTransitions < ActiveRecord::Migration
  def change
    create_table :payment_request_state_transitions, id: :uuid do |t|
      t.references :payment_request, null: false, foreign_key: true, type: :uuid, index: true
      t.string :from_state
      t.string :to_state, null: false
      t.string :event
      t.json :metadata, default: '{}'

      t.timestamps null: false
    end
  end
end
