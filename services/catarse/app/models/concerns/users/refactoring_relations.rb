# frozen_string_literal: true

module Users
  module RefactoringRelations
    extend ActiveSupport::Concern

    included do
      has_many :new_credit_cards, class_name: 'Billing::CreditCard', dependent: :destroy
      has_many :subscriptions, class_name: 'Membership::Subscription', dependent: :destroy
    end
  end
end
