# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::BillingOptions::Destroy, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(id: { type: Integer }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(id: billing_option_id) }

    context 'when billing_option doesn`t exist' do
      let(:billing_option_id) { 99_999_999 }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    context 'when billing_option exists' do
      let(:billing_option) { create(:membership_billing_option) }
      let(:billing_option_id) { billing_option.id }

      it { is_expected.to be_success }

      it 'destroys billing_option' do
        result

        expect { billing_option.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
