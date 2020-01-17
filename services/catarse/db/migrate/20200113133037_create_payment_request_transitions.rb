class CreatePaymentRequestTransitions < ActiveRecord::Migration
  def change
    create_table :payment_request_transitions, id: :uuid do |t|
      t.references :payment_request, null: false, foreign_key: true, type: :uuid
      t.string :to_state, null: false
      t.integer :sort_key, null: false
      t.boolean :most_recent, null: false
      t.json :metadata, default: '{}'

      t.timestamps null: false
    end

    add_index(
      :payment_request_transitions,
      %i[payment_request_id sort_key],
      unique: true,
      name: 'index_payment_request_transitions_parent_sort'
    )

    add_index(
      :payment_request_transitions,
      %i[payment_request_id most_recent],
      unique: true,
      where: 'most_recent',
      name: 'index_payment_request_transitions_parent_most_recent'
    )
  end
end
