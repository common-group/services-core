# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::BillingOptions::Update, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(id: { type: String }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(billing_option: { type: Membership::BillingOption }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(id: billing_option_id, attributes: attributes) }

    context 'when billing_option doesn`t exist' do
      let(:billing_option_id) { 'wrong-id' }
      let(:attributes) { {} }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    context 'when attributes are valid' do
      let(:billing_option) { create(:membership_billing_option) }
      let(:billing_option_id) { billing_option.id }
      let(:attributes) { attributes_for(:membership_billing_option).except(:tier_id).stringify_keys }

      it { is_expected.to be_success }

      it 'updates billing_option with given attribute' do
        result

        expect(billing_option.reload.attributes).to include(attributes.stringify_keys)
      end
    end

    context 'when attributes are invalid' do
      let(:billing_option) { create(:membership_billing_option) }
      let(:billing_option_id) { billing_option.id }
      let(:attributes) { { cadence_in_months: nil } }

      it { expect { result }.to raise_error(ActiveRecord::RecordInvalid) }
    end
  end
end
