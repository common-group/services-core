# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Shared::Addresses::Create, type: :action do
  describe 'inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(user: { type: User }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(address: { type: Shared::Address }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(user: user, attributes: attributes) }

    let(:user) { create(:user) }
    let(:attributes) { attributes_for(:shared_address, user: user).stringify_keys }

    it { is_expected.to be_success }

    it 'creates a new address' do
      expect { result }.to change(Shared::Address, :count).by(1)
    end

    it 'creates address with given attributes' do
      address = result.address

      expect(address.reload.attributes).to include(attributes)
    end
  end
end
