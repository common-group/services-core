# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::TierEntity, type: :entity do
  let(:resource) { build(:membership_tier, :with_fake_id) }
  let(:serializable_hash) { described_class.new(resource).serializable_hash }

  it 'exposes id' do
    expect(serializable_hash[:id]).to eq resource.id
  end

  it 'exposes name' do
    expect(serializable_hash[:name]).to eq resource.name
  end

  it 'exposes description' do
    expect(serializable_hash[:description]).to eq resource.description
  end

  it 'exposes subscribers_limit' do
    expect(serializable_hash[:subscribers_limit]).to eq resource.subscribers_limit
  end

  it 'exposes request_shipping_address' do
    expect(serializable_hash[:request_shipping_address]).to eq resource.request_shipping_address
  end

  it 'exposes order' do
    expect(serializable_hash[:order]).to eq resource.order
  end
end
