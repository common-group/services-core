# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::BillingOptionEntity, type: :entity do
  let(:resource) { build(:membership_billing_option, :with_fake_id) }
  let(:serializable_hash) { described_class.new(resource).serializable_hash }

  it 'exposes id' do
    expect(serializable_hash[:id]).to eq resource.id
  end

  it 'exposes cadence_in_months' do
    expect(serializable_hash[:cadence_in_months]).to eq resource.cadence_in_months
  end

  it 'exposes amount' do
    amount_hash = MoneyEntity.represent(resource.amount).serializable_hash

    expect(serializable_hash[:amount]).to eq amount_hash
  end

  it 'exposes enabled' do
    expect(serializable_hash[:enabled]).to eq resource.enabled
  end
end
