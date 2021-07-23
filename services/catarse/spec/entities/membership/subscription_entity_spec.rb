# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::SubscriptionEntity, type: :entity do
  let(:resource) { create(:membership_subscription) }
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

  it 'exposes state' do
    expect(serializable_hash[:state]).to eq resource.state
  end

  describe 'user' do
    it 'exposes id' do
      expect(serializable_hash.dig(:user, :id)).to eq resource.user.id
    end

    it 'exposes name' do
      expect(serializable_hash.dig(:user, :name)).to eq resource.user.name
    end
  end

  describe 'project' do
    it 'exposes id' do
      expect(serializable_hash.dig(:project, :id)).to eq resource.project.id
    end

    it 'exposes name' do
      expect(serializable_hash.dig(:project, :name)).to eq resource.project.name
    end

    it 'exposes permalink' do
      expect(serializable_hash.dig(:project, :permalink)).to eq resource.project.permalink
    end
  end

  describe 'tier' do
    it 'exposes id' do
      expect(serializable_hash.dig(:tier, :id)).to eq resource.tier.id
    end

    it 'exposes name' do
      expect(serializable_hash.dig(:tier, :name)).to eq resource.tier.name
    end
  end

  describe 'billing_option' do
    it 'exposes id' do
      expect(serializable_hash.dig(:billing_option, :id)).to eq resource.billing_option.id
    end
  end
end
