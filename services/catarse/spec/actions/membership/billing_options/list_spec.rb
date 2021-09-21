# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::BillingOptions::List, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(tier_id: { type: Integer }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(billing_options: { type: Enumerable }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(tier_id: tier_id) }

    context 'when tier exists' do
      let(:tier) { create(:membership_tier) }
      let!(:billing_options) { create_list(:membership_billing_option, 1, tier: tier) }
      let(:tier_id) { tier.id }

      it { is_expected.to be_success }

      it 'returns tier`s billing_options list' do
        expect(result.billing_options.to_a).to match_array billing_options
      end
    end

    context 'when tier doesn`t exist' do
      let(:tier_id) { 99_999_999 }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
