# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::Process, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to be_empty }
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe 'Play actors' do
    subject(:play_actors) do
      filtered_play_configs = described_class.play_actors.select do |play_config|
        play_config[:if].blank? || play_config[:if].call(result)
      end
      filtered_play_configs.pluck(:actor)
    end

    let(:result) { ServiceActor::Result.new(payment: payment) }

    context 'when payment method is boleto' do
      let(:payment) { Billing::Payment.new(payment_method: Billing::PaymentMethods::BOLETO) }

      it { is_expected.to eq [Billing::Payments::Create, Billing::Payments::GenerateBoleto] }
    end

    context 'when payment method is pix' do
      let(:payment) { Billing::Payment.new(payment_method: Billing::PaymentMethods::PIX) }

      it { is_expected.to eq [Billing::Payments::Create, Billing::Payments::GeneratePix] }
    end

    context 'when payment method is credit_card' do
      let(:payment) { Billing::Payment.new(payment_method: Billing::PaymentMethods::CREDIT_CARD) }
      let(:expected_actors) do
        [
          Billing::Payments::Create,
          Billing::Payments::AuthorizeTransaction,
          Billing::Payments::AnalyzeTransaction,
          Billing::Payments::CaptureOrRefundTransaction
        ]
      end

      it { is_expected.to eq expected_actors }
    end
  end
end
