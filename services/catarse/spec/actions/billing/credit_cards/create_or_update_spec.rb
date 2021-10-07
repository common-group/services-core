# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::CreditCards::CreateOrUpdate, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(user: { type: User }) }
    it { is_expected.to include(attributes: { type: Hash }) }

    it 'injects pagar_me_client dependency' do
      proc = inputs.dig(:pagar_me_client, :default)

      expect(proc.call).to be_an_instance_of(PagarMe::Client)
    end
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to include(credit_card: { type: Billing::CreditCard }) }
  end

  describe '#call' do
    subject(:result) do
      described_class.result(user: user, attributes: attributes, pagar_me_client: pagar_me_client)
    end

    let(:user) { create(:user) }
    let(:pagar_me_client) { PagarMe::Client.new }
    let(:attributes) do
      { hash: Faker::Lorem.word, billing_address_id: create(:common_address).id, saved: Faker::Boolean.boolean }
    end
    let(:gateway_response) do
      {
        'id' => Faker::Lorem.word,
        'holder_name' => Faker::Name.name,
        'first_digits' => Faker::Number.number(digits: 6).to_s,
        'last_digits' => Faker::Number.number(digits: 4).to_s,
        'country' => Faker::Address.country,
        'brand' => Faker::Business.credit_card_type,
        'expiration_date' => '0228'
      }
    end

    before do
      allow(pagar_me_client).to receive(:create_credit_card)
        .with(card_hash: attributes[:hash])
        .and_return(gateway_response)

      # another credit card from same user
      Billing::CreditCard.create(
        build(:billing_credit_card, user: user).attributes.merge(
          user: user, billing_address: create(:common_address), gateway_id: Faker::Number.number
        )
      )

      # "same" credit card from another user
      Billing::CreditCard.create(
        build(:billing_credit_card).attributes.merge(
          user: create(:user), billing_address: create(:common_address), gateway_id: gateway_response['id']
        )
      )
    end

    it { is_expected.to be_success }

    it 'creates credit card on gateway' do
      expect(pagar_me_client).to receive(:create_credit_card).with(card_hash: attributes[:hash])

      result
    end

    context 'when the user`s credit card is being used for the first time' do
      it 'creates a new credit card' do
        expect { result }.to change(Billing::CreditCard, :count).by(1)
      end

      it 'creates credit card with correct attributes' do
        expect(result.credit_card.attributes).to include(
          'user_id' => user.id,
          'gateway' => Billing::Gateways::PAGAR_ME,
          'gateway_id' => gateway_response['id'],
          'holder_name' => gateway_response['holder_name'],
          'bin' => gateway_response['first_digits'],
          'last_digits' => gateway_response['last_digits'],
          'country' => gateway_response['country'],
          'brand' => gateway_response['brand'],
          'expires_on' => Date.parse('2028-02-01')
        )
      end
    end

    context 'when the user`s credit card has been used before' do
      let!(:credit_card) do
        Billing::CreditCard.create(
          build(:billing_credit_card).attributes.merge(
            user: user,
            billing_address: create(:common_address),
            gateway_id: gateway_response['id']
          )
        ) # cannot use create(:billing_credit_card, gateway_id: ...) due to this issue https://github.com/thoughtbot/factory_bot/issues/1512
      end

      it 'doesn`t create a new credit card' do
        expect { result }.not_to change(Billing::CreditCard, :count)
      end

      it 'assigns saved flag and billing address to existing credit card' do
        result

        expect(credit_card.reload.attributes).to include(
          'saved' => attributes[:saved], 'billing_address_id' => attributes[:billing_address_id]
        )
      end

      it 'returns existing credit card' do
        expect(result.credit_card).to eq credit_card
      end
    end
  end
end
