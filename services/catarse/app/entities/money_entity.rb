# frozen_string_literal: true

class MoneyEntity < Grape::Entity
  expose(:value) { |amount| amount.to_d.to_s }
  expose(:currency) { |amount| amount.currency.iso_code }
  expose :format, as: :formatted
end
