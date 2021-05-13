# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItem, type: :model do
  it_behaves_like 'has state machine'

  describe 'Relations' do
    it { is_expected.to belong_to :payment }
    it { is_expected.to belong_to :payable }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of :payable_id }
    it { is_expected.to validate_presence_of :payable_type }

    it do
      payment_item = create(:billing_payment_item)
      expect(payment_item).to validate_uniqueness_of(:payable_id).scoped_to(:payable_type, :payment_id)
    end

    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
    it { is_expected.to validate_numericality_of(:shipping_fee).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than_or_equal_to(1) }
  end
end
