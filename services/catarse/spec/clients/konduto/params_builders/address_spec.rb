# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::ParamsBuilders::Address, type: :params_builder do
  subject(:params_builder) { described_class.new(address, credit_card) }

  let(:address) { Shared::Address.new(address_attributes) }
  let(:credit_card) { Billing::CreditCard.new(credit_card_attributes) }
  let(:address_attributes) { {} }
  let(:credit_card_attributes) { {} }

  describe 'ATTRIBUTES constant' do
    it 'returns params attributes' do
      expect(described_class::ATTRIBUTES).to eq %i[
        name address1 address2 city state zip country
      ]
    end
  end

  describe '#build' do
    let(:credit_card) { create(:billing_credit_card) }
    let(:address) { credit_card.payment.billing_address }

    it 'returns all attributes with corresponding methods results' do
      expect(params_builder.build).to eq(
        name: params_builder.name,
        address1: params_builder.address1,
        address2: params_builder.address2,
        city: params_builder.city,
        state: params_builder.state,
        zip: params_builder.zip,
        country: params_builder.country
      )
    end
  end

  describe '#name' do
    let(:credit_card_attributes) { { holder_name: Faker::Name.name } }

    it 'returns credit card holder name' do
      expect(params_builder.name).to eq credit_card.holder_name
    end
  end

  describe '#address1' do
    let(:address_attributes) { { line_1: Faker::Address.street_address } }

    it 'returns address line_1' do
      expect(params_builder.address1).to eq address.line_1
    end
  end

  describe '#address2' do
    let(:address_attributes) { { line_2: Faker::Address.secondary_address } }

    it 'returns address line_2' do
      expect(params_builder.address2).to eq address.line_2
    end
  end

  describe '#city' do
    let(:address_attributes) { { city: Faker::Address.city } }

    it 'returns address city' do
      expect(params_builder.city).to eq address.city
    end
  end

  describe '#state' do
    let(:address_attributes) { { state: Faker::Address.state } }

    it 'returns address state' do
      expect(params_builder.state).to eq address.state
    end
  end

  describe '#zip' do
    let(:address_attributes) { { postal_code: Faker::Address.zip_code } }

    it 'returns address postal code' do
      expect(params_builder.zip).to eq address.postal_code
    end
  end

  describe '#country' do
    let(:address_attributes) { { country_code: Faker::Address.country_code } }

    it 'returns address country code' do
      expect(params_builder.country).to eq address.country_code
    end
  end
end
