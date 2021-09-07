# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::BillingOptions::Create, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(tier_id: { type: Integer }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(billing_option: { type: Membership::BillingOption }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(tier_id: tier_id, attributes: attributes) }

    let(:tier) { create(:membership_tier) }

    context 'when attributes are valid' do
      let(:tier_id) { tier.id }
      let(:attributes) { attributes_for(:membership_billing_option).except(:tier_id) }

      it { is_expected.to be_success }

      it 'creates billing_option for given tier' do
        expect { result }.to change(tier.billing_options, :count).by(1)
      end

      it 'creates billing_option with given attribute' do
        expect(result.billing_option.attributes).to include(attributes.stringify_keys)
      end
    end

    context 'when attributes are invalid' do
      let(:tier_id) { tier.id }
      let(:attributes) { { cadence_in_months: nil } }

      it { expect { result }.to raise_error(ActiveRecord::RecordInvalid) }
    end

    context 'when tier doesn`t exist' do
      let(:tier_id) { 99_999_999 }
      let(:attributes) { {} }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
