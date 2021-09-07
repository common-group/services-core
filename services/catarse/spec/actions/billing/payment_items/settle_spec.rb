# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItems::Settle, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment_item: { type: Billing::PaymentItem }) }
    it { is_expected.to include(metadata: { type: Hash, default: {} }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment_item: payment_item, metadata: { data: 'example' }) }

    let(:payment_item) { create(:billing_payment_item, :subscription, :pending) }

    context 'when payment item cannot transition to paid' do
      before { allow(payment_item).to receive(:can_transition_to?).with(:paid).and_return(false) }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Payment item cannot transition to paid'
      end

      it 'doesn`t transition payment state' do
        result

        expect(payment_item.reload).to be_in_state(:pending)
      end
    end

    context 'when payment item can transition to paid' do
      it { is_expected.to be_success }

      it 'transitions payment item to paid' do
        result

        expect(payment_item.reload).to be_in_state(:paid)
      end
    end

    context 'with subscription as payable' do
      let(:payment_item) { create(:billing_payment_item, :subscription, :pending) }

      it 'confirms subscription payment' do
        expect(Membership::Subscriptions::ConfirmPayment).to receive(:call)
          .with(subscription: payment_item.payable, payment_item: payment_item)

        result
      end
    end

    context 'with contribution as payable' do
      let(:payment_item) { create(:billing_payment_item, :contribution, :pending) }

      it 'doesn`t try to confirm subscription payment' do
        expect(Membership::Subscriptions::ConfirmPayment).not_to receive(:call)

        result
      end
    end

    context 'when state transition cannot be done' do
      before { payment_item.payable = create(:membership_subscription, :canceled) }

      it 'rollbacks transaction' do
        begin
          result
        rescue Statesman::TransitionFailedError
          # does nothing
        end

        expect(payment_item.reload).to be_in_state(:pending)
      end
    end
  end
end
