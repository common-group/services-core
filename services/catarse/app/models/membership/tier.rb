# frozen_string_literal: true

module Membership
  class Tier < ApplicationRecord
    belongs_to :project

    has_many :billing_options, class_name: 'Membership::BillingOption', dependent: :destroy
    has_many :subscriptions, class_name: 'Membership::Subscription', dependent: :destroy

    validates :name, presence: true
    validates :description, presence: true

    validates :name, length: { maximum: 512 }
    validates :description, length: { maximum: 16_000 }

    validates :subscribers_limit, numericality: { greater_than: 0, only_integer: true }, allow_nil: true
    validates :order, numericality: { only_integer: true }
    validate :project_mode_is_membership

    private

    def project_mode_is_membership
      return if project.try(:is_sub?)

      errors.add(:project_id, I18n.t('models.membership.tier.errors.invalid_project'))
    end
  end
end
