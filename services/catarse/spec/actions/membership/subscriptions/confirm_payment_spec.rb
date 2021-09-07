# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscriptions::ConfirmPayment, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(subscription: { type: Membership::Subscription }) }
    it { is_expected.to include(payment_item: { type: Billing::PaymentItem }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(subscription: subscription, payment_item: payment_item) }

    let(:subscription) { create(:membership_subscription, :started, cadence_in_months: cadence_in_months) }
    let(:payment_item) { create(:billing_payment_item, payable: subscription, user: subscription.user) }
    let(:cadence_in_months) { 1 }

    it 'transitions subscription to active' do
      result

      expect(subscription.reload).to be_in_state(:active)
    end

    it 'updates next charge date according to cadence in months' do
      result

      expect(subscription.reload.next_charge_on).to eq Time.zone.today + cadence_in_months.months
    end

    it 'updates payment method, credit card and shipping address according to payment' do
      result

      expect(subscription.reload.attributes).to include(
        'payment_method' => payment_item.payment.payment_method,
        'credit_card_id' => payment_item.payment.credit_card_id,
        'shipping_address_id' => payment_item.payment.shipping_address_id
      )
    end
  end
end
