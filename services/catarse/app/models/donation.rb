# frozen_string_literal: true

class Donation < ApplicationRecord
  has_notifications
  has_many :contributions
  belongs_to :user
end
