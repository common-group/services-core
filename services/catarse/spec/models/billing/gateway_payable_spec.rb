# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::GatewayPayable, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment).class_name('Billing::Payment') }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_id) }
    it { is_expected.to validate_presence_of(:gateway_id) }
    it { is_expected.to validate_presence_of(:state) }
    it { is_expected.to validate_presence_of(:installment_number) }

    it do
      gateway_payable = create(:billing_gateway_payable)
      expect(gateway_payable).to validate_uniqueness_of(:gateway_id).scoped_to(:payment_id)
    end

    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
    it { is_expected.to validate_numericality_of(:fee).is_greater_than_or_equal_to(0) }
  end
end
