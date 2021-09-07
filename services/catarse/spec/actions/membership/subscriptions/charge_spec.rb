# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscriptions::Charge, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(subscription: { type: Membership::Subscription }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(subscription: subscription) }

    let(:subscription) { create(:membership_subscription, :pending_charge) }

    it 'creates and processes payment for subscription' do
      expect(Billing::Payments::Process).to receive(:call).with(
        user: subscription.user,
        attributes: {
          payment_method: subscription.payment_method,
          installments_count: 1,
          billing_address_id: 1, # TODO: use credit_card billing address
          shipping_address_id: subscription.shipping_address_id,
          credit_card_id: subscription.credit_card_id,
          payables: [id: subscription.id, type: subscription.class.name]
        }
      )

      result
    end

    context 'when an error occurs' do
      let(:error) { StandardError.new('some error') }

      before { allow(Billing::Payments::Process).to receive(:call).and_raise(error) }

      it 'sends message error to Sentry' do
        data = { level: :fatal, extra: { subscription_id: subscription.id } }
        expect(Sentry).to receive(:capture_exception).with(error, data)

        result
      end
    end
  end
end
