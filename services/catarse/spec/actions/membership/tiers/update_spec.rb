# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Tiers::Update, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(id: { type: Integer }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(tier: { type: Membership::Tier }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(id: tier_id, attributes: attributes) }

    context 'when tier doesn`t exist' do
      let(:tier_id) { 99_999_999 }
      let(:attributes) { {} }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    context 'when attributes are valid' do
      let(:tier) { create(:membership_tier) }
      let(:tier_id) { tier.id }
      let(:attributes) { attributes_for(:membership_tier).slice(:name, :description).stringify_keys }

      it { is_expected.to be_success }

      it 'updates tier with given attribute' do
        result

        expect(tier.reload.attributes).to include(attributes.stringify_keys)
      end
    end

    context 'when attributes are invalid' do
      let(:tier) { create(:membership_tier) }
      let(:tier_id) { tier.id }
      let(:attributes) { { name: nil } }

      it { expect { result }.to raise_error(ActiveRecord::RecordInvalid) }
    end
  end
end
