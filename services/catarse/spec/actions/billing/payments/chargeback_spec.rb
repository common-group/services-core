# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::Chargeback, type: :action do
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

    let(:payment) { create(:billing_payment, :paid) }

    context 'when payment state cannot transition to charged_back' do
      before { allow(payment).to receive(:can_transition_to?).with(:charged_back).and_return(false) }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Payment cannot transition to charged_back'
      end

      it 'doesn`t transition payment state' do
        result

        expect(payment.reload).to be_in_state(:paid)
      end
    end

    context 'when payment state can transition to charged_back' do
      it { is_expected.to be_success }

      it 'transitions payment state to charged_back' do
        result

        expect(payment.reload).to be_in_state(:charged_back)
      end
    end
  end
end
