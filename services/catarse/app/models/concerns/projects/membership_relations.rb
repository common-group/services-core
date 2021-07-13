# frozen_string_literal: true

module Projects
  module MembershipRelations
    extend ActiveSupport::Concern

    included do
      has_many :tiers, class_name: 'Membership::Tier', dependent: :destroy
      has_many :subscriptions, class_name: 'Membership::Subscription', dependent: :destroy
    end
  end
end
