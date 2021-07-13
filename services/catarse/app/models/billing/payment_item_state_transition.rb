# frozen_string_literal: true

module Billing
  class PaymentItemStateTransition < ApplicationRecord
    belongs_to :payment_item, class_name: 'Billing::PaymentItem', inverse_of: :state_transitions

    after_destroy :update_most_recent, if: :most_recent?

    private

    def update_most_recent
      last_transition = payment_item.payment_state_transitions.order(:sort_key).last
      return if last_transition.blank?

      last_transition.update(most_recent: true)
    end
  end
end
