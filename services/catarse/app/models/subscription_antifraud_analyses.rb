# frozen_string_literal: true

class SubscriptionAntifraudAnalyses < ApplicationRecord
  include Shared::CommonWrapper

  self.table_name = 'common_schema.antifraud_analyses'
  self.primary_key = :id

  belongs_to :subscription_payment
end
