# frozen_string_literal: true

module BillingFactoriesHelpers
  PAYMENT_ITEM_STATES_CONVERSION = {
    created: :pending,
    waiting_payment: :pending,
    authorized: :pending,
    approved_on_antifraud: :pending,
    declined_on_antifraud: :pending,
    waiting_review: :pending,
    paid: :paid,
    expired: :canceled,
    refused: :canceled,
    refunded: :refunded,
    charged_back: :charged_back
  }.freeze

  SUBSCRIPTION_STATES_CONVERSION = {
    pending: :started,
    paid: :active,
    canceled: :canceled,
    refunded: :inactive,
    charged_back: :inactive
  }.freeze

  def self.convert_payment_state_to_item_state(state)
    PAYMENT_ITEM_STATES_CONVERSION[state.to_sym]
  end

  def self.convert_item_state_to_subscription_state(state)
    SUBSCRIPTION_STATES_CONVERSION[state.to_sym]
  end
end
