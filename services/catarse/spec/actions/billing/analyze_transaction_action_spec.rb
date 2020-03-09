require 'rails_helper'

RSpec.describe Billing::AnalyzeTransactionAction, type: :action do
  describe 'Behavior' do
    let(:payment_request) { double(id: 'pr-id', credit_card: double(gateway_id: 'card-id'), user_id: 'user-id') }

    context 'when credit card is in safelist' do
      before { allow(described_class).to receive(:is_credit_card_in_safelist?).with('card-id').and_return(true) }

      it 'skips to next context' do
        expect_any_instance_of(Billing::Antifraud::Konduto::Client).to_not receive(:analyze_transaction)

        described_class.execute(payment_request: payment_request)
      end
    end

    context 'when credit card isn`t in safelist' do
      let(:antifraud_client) { Billing::Antifraud::Konduto::Client.new }
      let(:response) { { order: { recommendation: Faker::Lorem.word } } }
      let(:transaction_params) { double(:transaction_params) }

      before do
        allow(described_class).to receive(:is_credit_card_in_safelist?).with('card-id').and_return(false)
        allow(described_class).to receive(:transaction_params).with(payment_request).and_return(transaction_params)

        allow_any_instance_of(Billing::Antifraud::Konduto::Client).to receive(:analyze_transaction)
          .with(transaction_params: transaction_params)
          .and_return(response)
      end

      it 'sends transaction to antifraud analyze' do
        expect_any_instance_of(Billing::Antifraud::Konduto::Client).to receive(:analyze_transaction)
          .with(transaction_params: transaction_params)

        described_class.execute(payment_request: payment_request)
      end

      context 'when antifraud recommends payment approvation' do
        let(:response) { { order: { recommendation: 'approve' } } }

        it 'approves payment request' do
          expect(payment_request).to receive(:approve!).with(metadata: response)
          expect(payment_request).to_not receive(:decline!)
          expect(payment_request).to_not receive(:wait_review!)

          result = described_class.execute(payment_request: payment_request)

          expect(result).to be_success
        end
      end

      context 'when antifraud recommends payment rejection' do
        let(:response) { { order: { recommendation: 'decline' } } }

        it 'declines payment request' do
          expect(payment_request).to receive(:decline!).with(metadata: response)
          expect(payment_request).to_not receive(:approve!)
          expect(payment_request).to_not receive(:wait_review!)

          result = described_class.execute(payment_request: payment_request)

          expect(result).to be_success
        end
      end

      context 'when antifraud recommends payment review' do
        let(:response) { { order: { recommendation: 'review' } } }

        it 'waits payment request review' do
          expect(payment_request).to receive(:wait_review!).with(metadata: response)
          expect(payment_request).to_not receive(:approve!)
          expect(payment_request).to_not receive(:decline!)

          result = described_class.execute(payment_request: payment_request)

          expect(result).to be_success
        end
      end

      context 'when antifraud has no recommendation' do
        let(:response) { { order: { recommendation: 'none' } } }

        it 'skips to next context' do
          expect(payment_request).to_not receive(:wait_review!)
          expect(payment_request).to_not receive(:approve!)
          expect(payment_request).to_not receive(:decline!)
          expect(Raven).to_not receive(:capture_message)

          result = described_class.execute(payment_request: payment_request)

          expect(result).to be_success
        end
      end

      context 'when antifraud returns an unknown recommendation' do
        let(:response) { { order: { recommendation: Faker::Lorem.word } } }

        it 'captures message via Raven' do
          expect(Raven).to receive(:capture_message)
            .with(
              'Invalid antifraud request',
              level: :fatal,
              user: { id: payment_request.user_id },
              extra: response.merge(payment_request_id: payment_request.id)
            )

          described_class.execute(payment_request: payment_request)
        end

        it 'fails context' do
          context = described_class.execute(payment_request: payment_request)

          expect(context).to be_failure
        end
      end
    end
  end

  describe 'Class methods' do
    describe '.antifraud_client' do
      before { described_class.class_variable_set(:@@antifraud_client, nil) }

      it 'returns a Konduto client' do
        antifraud_client = described_class.antifraud_client
        expect(antifraud_client).to be_a(Billing::Antifraud::Konduto::Client)
      end
    end

    describe '.transaction_params' do
      let(:payment_request) { double(:payment_request) }
      let(:data) { { key: 'value' } }
      let(:params_builder) { double(:params_builder, build: data) }

      before do
        allow(Billing::Antifraud::Konduto::TransactionParamsBuilder).to receive(:new)
          .with(payment_request)
          .and_return(params_builder)
      end

      it 'builds transaction params with Konduto::TransactionParamsBuilder' do
        expect(described_class.transaction_params(payment_request)).to eq data
      end
    end

    describe '.is_credit_card_in_safelist?' do
      let(:gateway_id) { Faker::Lorem.word }
      let(:result) { double }

      it 'checks if credit card is in safelist' do
        allow(Billing::CreditCard).to receive_message_chain('safelist.where')
          .with(gateway_id: gateway_id)
          .and_return(double(exists?: result))

        expect(described_class.is_credit_card_in_safelist?(gateway_id)).to eq result
      end
    end
  end
end
