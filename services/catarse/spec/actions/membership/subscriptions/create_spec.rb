# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscriptions::Create, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(user: { type: User }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(subscription: { type: Membership::Subscription }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(user: user, attributes: attributes) }

    let(:user) { create(:user) }
    let(:billing_option) { create(:membership_billing_option) }
    let(:attributes) do
      {
        billing_option_id: billing_option.id,
        amount_cents: billing_option.amount_cents + Faker::Number.number(digits: 3)
      }
    end

    context 'when attributes are valid' do
      it { is_expected.to be_success }

      it 'creates a new user subscription' do
        expect { result }.to change(user.subscriptions, :count).by(1)
      end

      it 'creates subscription with billing option info and initial subscription state' do
        expect(result.subscription.attributes).to include(
          'project_id' => billing_option.project.id,
          'tier_id' => billing_option.tier.id,
          'billing_option_id' => billing_option.id,
          'cadence_in_months' => billing_option.cadence_in_months,
          'state' => Membership::SubscriptionStateMachine.initial_state,
          'amount_cents' => attributes[:amount_cents]
        )
      end
    end

    context 'when billing option doesn`t exist' do
      before { attributes[:billing_option_id] = 'wrong-id' }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    context 'when attributes are invalid' do
      before { attributes[:amount_cents] = -300 }

      it { expect { result }.to raise_error(ActiveRecord::RecordInvalid) }
    end
  end
end
