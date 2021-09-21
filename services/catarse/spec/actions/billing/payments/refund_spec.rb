# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::Refund, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }

    it 'includes metadata with a empty hash as default value' do
      expect(inputs.dig(:metadata, :default)).to eq({})
    end
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment: payment, metadata: { data: 'example' }) }

    let(:payment) { create(:simple_payment, :paid) }

    before { payment.items.each { |item| allow(item).to receive(:refund!) } }

    context 'when payment state cannot transition to refunded' do
      before { allow(payment).to receive(:can_transition_to?).with(:refunded).and_return(false) }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Payment cannot transition to refunded'
      end

      it 'doesn`t transition payment state' do
        result

        expect(payment.reload).to be_in_state(:paid)
      end
    end

    context 'when payment state can transition to refunded' do
      it { is_expected.to be_success }

      it 'transitions payment state to refunded' do
        result

        expect(payment.reload).to be_in_state(:refunded)
      end

      it 'refunds payment items' do
        expect(payment.items).to all(receive(:refund!))

        result
      end
    end

    context 'when state transition cannot be done' do
      before do
        create(:billing_payment_item, :contribution, :pending, payment: payment)
        payment.reload
      end

      it 'rollbacks transaction' do
        begin
          result
        rescue Statesman::TransitionFailedError
          # does nothing
        end

        expect(payment.reload).to be_in_state(:paid)
      end
    end
  end
end
