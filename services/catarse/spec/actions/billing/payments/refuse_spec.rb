# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::Refuse, type: :action do
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

    let(:payment) { create(:billing_payment, :created) }

    context 'when payment state cannot transition to refused' do
      before { allow(payment).to receive(:can_transition_to?).with(:refused).and_return(false) }

      it { is_expected.to be_failure }

      it 'returns error message' do
        expect(result.error).to eq 'Payment cannot transition to refused'
      end

      it 'doesn`t transition payment state' do
        result

        expect(payment.reload).to be_in_state(:created)
      end
    end

    context 'when payment state can transition to refused' do
      it { is_expected.to be_success }

      it 'transitions payment state to refused' do
        result

        expect(payment.reload).to be_in_state(:refused)
      end
    end
  end
end
