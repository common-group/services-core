# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::ProcessingFee, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment).class_name('Billing::Payment') }
  end

  describe 'Configurations' do
    it 'setups vendor with Billing::ProcessingFeeVendors enum' do
      expect(described_class.enumerations).to include(vendor: Billing::ProcessingFeeVendors)
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_id) }
    it { is_expected.to validate_presence_of(:vendor) }

    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
  end
end
