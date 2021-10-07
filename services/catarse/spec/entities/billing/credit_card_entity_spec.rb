# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::CreditCardEntity, type: :entity do
  let(:resource) { build(:billing_credit_card, :with_fake_id) }
  let(:serializable_hash) { described_class.new(resource).serializable_hash }

  it 'exposes id' do
    expect(serializable_hash[:id]).to eq resource.id
  end

  it 'exposes billing address' do
    address_hash = Common::AddressEntity.represent(resource.billing_address).serializable_hash

    expect(serializable_hash[:billing_address]).to eq address_hash
  end

  it 'exposes holder_name' do
    expect(serializable_hash[:holder_name]).to eq resource.holder_name
  end

  it 'exposes bin' do
    expect(serializable_hash[:bin]).to eq resource.bin
  end

  it 'exposes last_digits' do
    expect(serializable_hash[:last_digits]).to eq resource.last_digits
  end

  it 'exposes brand' do
    expect(serializable_hash[:brand]).to eq resource.brand
  end

  it 'exposes expires_on' do
    expect(serializable_hash[:expires_on]).to eq resource.expires_on.iso8601
  end
end
