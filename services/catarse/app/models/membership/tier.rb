# frozen_string_literal: true

module Membership
  class Tier < ApplicationRecord
    belongs_to :project

    validates :name, presence: true
    validates :description, presence: true

    validates :name, length: { maximum: 512 }
    validates :description, length: { maximum: 16_000 }

    validates :subscribers_limit, numericality: { greater_than: 0, only_integer: true }, allow_nil: true
    validates :order, numericality: { only_integer: true }
  end
end
