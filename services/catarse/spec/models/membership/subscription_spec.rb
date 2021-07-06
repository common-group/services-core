# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscription, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:project) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:tier).class_name('Membership::Tier') }
    it { is_expected.to belong_to(:billing_option).class_name('Membership::BillingOption') }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:project_id) }
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:tier_id) }
    it { is_expected.to validate_presence_of(:billing_option_id) }

    it do
      subscription = create(:membership_subscription)
      expect(subscription).to validate_uniqueness_of(:tier_id).scoped_to(:user_id).case_insensitive
    end

    it { is_expected.to validate_numericality_of(:cadence_in_months).is_equal_to(1).only_integer }
    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
  end
end
