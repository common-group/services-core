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

    context 'when the payment and payable user are the same' do
      subject(:payment_item) { described_class.new(payment: payment, payable: payable) }

      let(:payment) { Billing::Payment.new(user: User.new(id: 1)) }
      let(:payable) { Contribution.new(id: 1, user: User.new(id: 1)) }

      it 'doesn`t add invalid user error' do
        payment_item.valid?

        expect(payment_item.errors[:payable]).to be_empty
      end
    end

    context 'when the payment and payable user are different' do
      subject(:payment_item) { described_class.new(payment: payment, payable: payable) }

      let(:payment) { Billing::Payment.new(user: User.new(id: 1)) }
      let(:payable) { Contribution.new(id: 1, user: User.new(id: 2)) }

      it 'adds invalid invalid user error message' do
        payment_item.valid?

        error_message = I18n.t('models.billing.payment_item.errors.invalid_user')
        expect(payment_item.errors[:payable]).to include error_message
      end
    end
  end
end
