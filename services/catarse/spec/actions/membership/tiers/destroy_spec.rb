# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Tiers::Destroy, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(id: { type: Integer }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(id: tier_id) }

    context 'when tier doesn`t exist' do
      let(:tier_id) { 99_999_999 }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    context 'when tier exists' do
      let(:tier) { create(:membership_tier) }
      let(:tier_id) { tier.id }

      it { is_expected.to be_success }

      it 'destroys tier' do
        result

        expect { tier.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
