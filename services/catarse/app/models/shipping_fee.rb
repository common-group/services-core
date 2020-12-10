# frozen_string_literal: true

class ShippingFee < ApplicationRecord
  include I18n::Alchemy
  belongs_to :reward
  validates_presence_of :value, :destination
end
