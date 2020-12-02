# frozen_string_literal: true

class RedactorRails::Asset < ApplicationRecord
  include RedactorRails::Orm::ActiveRecord::AssetBase
  delegate :url, :current_path, :size, :content_type, :filename, to: :data
  validates_presence_of :data
end
