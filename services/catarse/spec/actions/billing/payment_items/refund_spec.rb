# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItems::Refund, type: :action do
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

    let(:payment_item) { create(:billing_payment_item, :subscription, :paid) }

    context 'when payment item cannot transition to refunded' do
      before { allow(payment_item).to receive(:can_transition_to?).with(:refunded).and_return(false) }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Payment item cannot transition to refunded'
      end

      it 'doesn`t transition payment state' do
        result

        expect(payment_item.reload).to be_in_state(:paid)
      end
    end

    context 'when payment item can transition to refunded' do
      it { is_expected.to be_success }

      it 'transitions payment item to refunded' do
        result

        expect(payment_item.reload).to be_in_state(:refunded)
      end
    end

    context 'with subscription as payable' do
      let(:payment_item) { create(:billing_payment_item, :subscription, :paid) }

      it 'deactivates subscription' do
        result

        expect(payment_item.payable.reload).to be_in_state(:inactive)
      end
    end

    context 'with contribution as payable' do
      let(:payment_item) { create(:billing_payment_item, :contribution, :paid) }

      it 'doesn`t try to deactivate contribution' do
        expect { result }.not_to raise_error
      end
    end

    context 'when state transition cannot be done' do
      before { payment_item.payable = create(:membership_subscription, :started) }

      it 'rollbacks transaction' do
        begin
          result
        rescue Statesman::TransitionFailedError
          # does nothing
        end

        expect(payment_item.reload).to be_in_state(:paid)
      end
    end
  end
end
