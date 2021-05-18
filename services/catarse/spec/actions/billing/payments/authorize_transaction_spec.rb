# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::AuthorizeTransaction, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }

    it 'injects pagar_me_client dependency' do
      proc = inputs.dig(:pagar_me_client, :default)

      expect(proc.call).to be_an_instance_of(PagarMe::Client)
    end
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment: payment, pagar_me_client: pagar_me_client) }

    let(:payment) { create(:billing_payment, :created, :credit_card) }
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:transaction_params) { PagarMe::TransactionParamsBuilder.new(payment: payment).build }
    let(:gateway_response) do
      {
        'status' => 'authorized',
        'id' => Faker::Internet.uuid,
        'card' => {
          'id' => Faker::Lorem.word,
          'holder_name' => Faker::Name.name,
          'first_digits' => Faker::Number.number(digits: 6).to_s,
          'last_digits' => Faker::Number.number(digits: 4).to_s,
          'country' => Faker::Address.country,
          'brand' => Faker::Business.credit_card_type,
          'expiration_date' => '0228'
        }
      }
    end

    before do
      allow(pagar_me_client).to receive(:create_transaction).with(transaction_params).and_return(gateway_response)
    end

    it 'creates transaction on gateway' do
      expect(pagar_me_client).to receive(:create_transaction).with(transaction_params)

      result
    end

    %i[authorized refused].each do |gateway_status|
      context "when gateway response status is #{gateway_status}" do
        before { gateway_response['status'] = gateway_status.to_s }

        it { is_expected.to be_success }

        it "transitions payment status to #{gateway_status}" do
          result

          expect(payment.reload).to be_in_state(gateway_status)
        end

        it 'updates payment gateway and gateway id' do
          result

          expect(payment.reload.attributes).to include('gateway' => 'pagar_me', 'gateway_id' => gateway_response['id'])
        end
      end
    end

    context 'when credit card hasn`t been used by user before' do
      before do
        Billing::CreditCard.create(
          attributes_for(:billing_credit_card).merge(
            gateway: 'pagar_me',
            user_id: create(:user).id,
            gateway_id: gateway_response['card']['id']
          )
        )
      end

      it 'creates credit card' do
        expect { result }.to change(Billing::CreditCard, :count).by(1)
      end

      it 'assigns created credit card to payment' do
        result

        expect(payment.credit_card.attributes).to include(
          'user_id' => payment.user_id,
          'gateway' => payment.gateway,
          'gateway_id' => gateway_response.dig('card', 'id'),
          'holder_name' => gateway_response.dig('card', 'holder_name'),
          'bin' => gateway_response.dig('card', 'first_digits'),
          'last_digits' => gateway_response.dig('card', 'last_digits'),
          'country' => gateway_response.dig('card', 'country'),
          'brand' => gateway_response.dig('card', 'brand'),
          'expires_on' => Date.parse('2028-02-01')
        )
      end
    end

    context 'when payment already has a credit card' do
      let(:payment) { create(:billing_payment, :created, :with_credit_card) }

      it 'doesn`t create credit card' do
        expect { result }.not_to change(Billing::CreditCard, :count)
      end

      it 'doesn`t change payment credit card' do
        expect { result }.not_to change(payment, :credit_card_id)
      end
    end

    context 'when credit card has been used by user before' do
      let!(:credit_card) do
        Billing::CreditCard.create(
          attributes_for(:billing_credit_card).merge(
            user_id: payment.user_id,
            gateway_id: gateway_response['card']['id'],
            gateway: 'pagar_me'
          )
        )
      end

      before do
        payment.update!(credit_card_id: nil)
        Billing::CreditCard.create(
          attributes_for(:billing_credit_card).merge(
            gateway: 'pagar_me',
            user_id: create(:user).id,
            gateway_id: gateway_response['card']['id']
          )
        )
        gateway_response['card']['id'] = credit_card.gateway_id
      end

      it 'doesn`t create credit card' do
        expect { result }.not_to change(Billing::CreditCard, :count)
      end

      it 'assigns found credit card to payment' do
        result

        expect(payment.credit_card_id).to eq(credit_card.id)
      end
    end

    context 'when gateway response status is unexpected' do
      let(:gateway_response) { { 'status' => Faker::Lorem.word } }

      it { is_expected.to be_failure }

      it 'sends message error to Sentry' do
        data = { level: :fatal, extra: { data: gateway_response, payment_id: payment.id, user_id: payment.user_id } }
        expect(Sentry).to receive(:capture_message).with('Invalid gateway request', data)

        result
      end
    end
  end
end
