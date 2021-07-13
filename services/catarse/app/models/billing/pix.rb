# frozen_string_literal: true

module Billing
  class Pix < ApplicationRecord
    belongs_to :payment, class_name: 'Billing::Payment'

    validates :payment_id, presence: true
    validates :key, presence: true
    validates :expires_on, presence: true
  end
end
