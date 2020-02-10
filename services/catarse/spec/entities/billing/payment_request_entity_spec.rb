require 'rails_helper'

RSpec.describe Billing::PaymentRequestEntity, type: :model do
  let(:resource) { build(:payment_request, :with_fake_id, :credit_card) }
  let(:serializable_hash) { described_class.new(resource).serializable_hash }

  describe 'Exposures' do
    it 'exposes id' do
      expect(serializable_hash[:id]).to eq resource.id
    end

    it 'exposes state' do
      expect(serializable_hash[:state]).to eq resource.state
    end

    it 'exposes total_amount' do
      expect(serializable_hash[:total_amount]).to eq resource.total_amount
    end

    it 'exposes payment_method' do
      expect(serializable_hash[:payment_method]).to eq resource.payment_method
    end

    it 'exposes installments_count' do
      expect(serializable_hash[:installments_count]).to eq resource.installments_count
    end

    it 'exposes billing_address' do
      expect(serializable_hash[:billing_address].to_json).to eq resource.billing_address.to_json
    end

    it 'exposes items' do
      expect(serializable_hash[:items]).to eq resource.items
    end
  end
end
