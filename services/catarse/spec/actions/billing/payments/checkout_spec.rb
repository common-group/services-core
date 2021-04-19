require 'rails_helper'

RSpec.describe Billing::Payments::Checkout, type: :action do
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
      described_class.play_actors.map do |play_actor|
        play_actor[:actor] if play_actor[:if].blank? || play_actor[:if].call(result)
      end.compact
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
