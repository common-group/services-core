require 'rails_helper'

RSpec.describe Billing::ProcessCheckout, type: :organizer do
  let(:user) { double }
  let(:payment_request_attributes) { double }

  describe '.call' do
    context 'when is a bank slip payment request' do
      let(:context) do
        LightService::Context.make(
          user: user,
          payment_request_attributes: payment_request_attributes,
          payment_request: double(bank_slip?: true, credit_card?: false)
        )
      end

      it 'calls bank slip generation actions' do
        expect(Billing::CreatePaymentRequestAction).to receive(:execute).with(context).ordered
        expect(Billing::GenerateBankSlipAction).to receive(:execute).with(context).ordered

        described_class.call(context)
      end
    end

    context 'when is a credit card payment request' do
      let(:context) do
        LightService::Context.make(
          user: user,
          payment_request_attributes: payment_request_attributes,
          payment_request: double(bank_slip?: false, credit_card?: true)
        )
      end

      it 'calls credit card processing actions' do
        expect(Billing::CreatePaymentRequestAction).to receive(:execute).with(context).ordered
        expect(Billing::AuthorizeTransactionAction).to receive(:execute).with(context).ordered
        expect(Billing::AnalyzeTransactionAction).to receive(:execute).with(context).ordered
        expect(Billing::CaptureOrRefundTransactionAction).to receive(:execute).with(context).ordered

        described_class.call(context)
      end
    end
  end
end
