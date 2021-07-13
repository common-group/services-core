# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Shared::AddressReplicator, type: :lib do
  describe '.by_id' do
    let!(:address) { create(:shared_address) }

    it 'creates a new address' do
      expect { described_class.by_id(address.id) }.to change(Shared::Address, :count).by(1)
    end

    it 'returns created replica' do
      replica = described_class.by_id(address.id)

      expect(replica.attributes).to include(address.attributes.except('id', 'created_at', 'updated_at'))
    end

    context 'when replica is invalid' do
      let!(:invalid_replica) { Shared::Address.new }

      before { allow(Shared::Address).to receive(:find).with(address.id).and_return(address) }

      it 'raises error' do
        allow(address).to receive(:dup).and_return(invalid_replica)

        expect { described_class.by_id(address.id) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
