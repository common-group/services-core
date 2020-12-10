# frozen_string_literal: true

class Tag < ApplicationRecord
  has_many :taggings
  has_many :projects, through: :taggings

  validates_uniqueness_of :slug
end
