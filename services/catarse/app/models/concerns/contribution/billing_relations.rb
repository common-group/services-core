# frozen_string_literal: true

module Contribution::BillingRelations # rubocop:disable Style/ClassAndModuleChildren
  extend ActiveSupport::Concern

  included do
    has_many :payment_items,
      as: :payable,
      class_name: 'Billing::PaymentItem',
      primary_key: :uuid_ref,
      dependent: :destroy
  end
end
