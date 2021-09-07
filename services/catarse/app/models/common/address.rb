# frozen_string_literal: true

module Common
  class Address < ApplicationRecord
    belongs_to :user

    validates :user_id, presence: true
    validates :country_code, presence: true
    validates :line_1, presence: true
    validates :city, presence: true
    validates :state, presence: true

    validates :postal_code, length: { maximum: 256 }
    validates :country_code, length: { maximum: 2 }
    validates :line_1, length: { maximum: 512 }
    validates :line_2, length: { maximum: 512 }
    validates :number, length: { maximum: 64 }
    validates :neighborhood, length: { maximum: 128 }
    validates :city, length: { maximum: 256 }
    validates :state, length: { maximum: 256 }
    validates :phone_number, length: { maximum: 64 }
    validates :first_name, length: { maximum: 128 }
    validates :last_name, length: { maximum: 128 }
    validates :organization, length: { maximum: 128 }

    validates :country_code, inclusion: { in: ISO3166::Country.all.map(&:alpha2) }
  end
end
