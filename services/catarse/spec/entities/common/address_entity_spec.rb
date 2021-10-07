# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Common::AddressEntity, type: :entity do
  let(:resource) { build(:common_address, :with_fake_id) }
  let(:serializable_hash) { described_class.new(resource).serializable_hash }

  it 'exposes id' do
    expect(serializable_hash[:id]).to eq resource.id
  end

  it 'exposes user_id' do
    expect(serializable_hash[:user_id]).to eq resource.user_id
  end

  it 'exposes country_code' do
    expect(serializable_hash[:country_code]).to eq resource.country_code
  end

  it 'exposes postal_code' do
    expect(serializable_hash[:postal_code]).to eq resource.postal_code
  end

  it 'exposes line_1' do
    expect(serializable_hash[:line_1]).to eq resource.line_1
  end

  it 'exposes line_2' do
    expect(serializable_hash[:line_2]).to eq resource.line_2
  end

  it 'exposes number' do
    expect(serializable_hash[:number]).to eq resource.number
  end

  it 'exposes neighborhood' do
    expect(serializable_hash[:neighborhood]).to eq resource.neighborhood
  end

  it 'exposes city' do
    expect(serializable_hash[:city]).to eq resource.city
  end

  it 'exposes state' do
    expect(serializable_hash[:state]).to eq resource.state
  end

  it 'exposes phone_number' do
    expect(serializable_hash[:phone_number]).to eq resource.phone_number
  end

  it 'exposes first_name' do
    expect(serializable_hash[:first_name]).to eq resource.first_name
  end

  it 'exposes last_name' do
    expect(serializable_hash[:last_name]).to eq resource.last_name
  end

  it 'exposes organization' do
    expect(serializable_hash[:organization]).to eq resource.organization
  end
end
