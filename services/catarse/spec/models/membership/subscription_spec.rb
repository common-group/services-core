# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscription, type: :model do
  it_behaves_like 'has state machine'

  describe 'Relations' do
    it { is_expected.to belong_to(:project) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:tier).class_name('Membership::Tier') }
    it { is_expected.to belong_to(:billing_option).class_name('Membership::BillingOption') }
    it { is_expected.to belong_to(:credit_card).class_name('Billing::CreditCard').optional }
    it { is_expected.to belong_to(:shipping_address).class_name('Shared::Address').optional }

    it { is_expected.to have_many(:payment_items).class_name('Billing::PaymentItem').dependent(:restrict_with_error) }
  end

  describe 'Configurations' do
    it 'setups payment_method with Billing::PaymentMethods enum' do
      expect(described_class.enumerations).to include(payment_method: Billing::PaymentMethods)
    end
  end

  describe 'Scopes' do
    describe '#pending_charge' do
      it 'returns subscriptions pending charge' do
        expect(Membership::Subscriptions::PendingChargeQuery).to receive(:call)

        described_class.pending_charge
      end
    end
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
