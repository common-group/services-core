# frozen_string_literal: true

module Users
  module MembershipRelations
    extend ActiveSupport::Concern

    included do
      has_many :subscriptions, class_name: 'Membership::Subscription', dependent: :destroy
    end
  end
end
