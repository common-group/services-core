require 'rails_helper'

RSpec.describe Konduto::ParamsBuilders::Customer, type: :params_builder do
  subject(:params_builder) { described_class.new(user) }

  let(:user) { User.new(user_attributes) }

  describe 'ATTRIBUTES constant' do
    it 'returns params attributes' do
      expect(described_class::ATTRIBUTES).to eq %i[
        id name email dob tax_id phone1 created_at
      ]
    end
  end

  describe '#build' do
    let(:user) { create(:user) }

    it 'returns all attributes with corresponding methods results' do
      expect(params_builder.build).to eq(
        id: params_builder.id,
        name: params_builder.name,
        email: params_builder.email,
        dob: params_builder.dob,
        tax_id: params_builder.tax_id,
        phone1: params_builder.phone1,
        created_at: params_builder.created_at
      )
    end
  end

  describe '#id' do
    let(:user_attributes) { { id: 1234 } }

    it 'returns user id' do
      expect(params_builder.id).to eq user.id.to_s
    end
  end

  describe '#name' do
    let(:user_attributes) { { name: Faker::Name.name } }

    it 'returns user name' do
      expect(params_builder.name).to eq user.name
    end
  end

  describe '#email' do
    let(:user_attributes) { { email: Faker::Internet.email } }

    it 'returns user email' do
      expect(params_builder.email).to eq user.email
    end
  end

  describe '#dob' do
    let(:user_attributes) { { birth_date: Faker::Time.backward(days: 30).to_date } }

    it 'returns user birth_date using iso8601 format' do
      expect(params_builder.dob).to eq user.birth_date.iso8601
    end
  end

  describe '#tax_id' do
    let(:user_attributes) { { cpf: Faker::IDNumber.brazilian_citizen_number(formatted: true) } }

    it 'returns user unformatted document' do
      expect(params_builder.tax_id).to eq user.unformatted_document
    end
  end

  describe '#phone1' do
    let(:address) { Address.new(phone_number: Faker::PhoneNumber.cell_phone) }
    let(:user_attributes) { { address: address } }

    it 'returns user phone_number' do
      expect(params_builder.phone1).to eq user.phone_number
    end
  end

  describe '#created_at' do
    let(:user_attributes) { { created_at: Faker::Time.backward(days: 30) } }

    it 'returns user created_at date using iso8601 format' do
      expect(params_builder.created_at).to eq user.created_at.to_date.iso8601
    end
  end
end
