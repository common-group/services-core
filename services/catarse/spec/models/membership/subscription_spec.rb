# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscription, type: :model do
  it_behaves_like 'has state machine'

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
      expect(subscription).to validate_uniqueness_of(:user_id).scoped_to(:project_id).case_insensitive
    end

    it { is_expected.to validate_numericality_of(:cadence_in_months).is_equal_to(1).only_integer }

    it do
      sub = create(:membership_subscription)
      expect(sub).to validate_numericality_of(:amount_cents)
        .is_greater_than_or_equal_to(sub.billing_option.amount_cents)
    end
  end
end
