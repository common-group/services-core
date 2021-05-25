# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payment, type: :model do
  it_behaves_like 'has state machine'

  describe 'Relations' do
    subject(:payment) { described_class.new }

    it { is_expected.to belong_to :user }
    it { is_expected.to belong_to(:billing_address).class_name('Shared::Address') }
    it { is_expected.to belong_to(:shipping_address).class_name('Shared::Address').optional }
    it { is_expected.to belong_to(:credit_card).class_name('Billing::CreditCard').optional }

    it { is_expected.to have_one(:pix).class_name('Billing::Pix').dependent(:destroy) }
    it { is_expected.to have_one(:boleto).class_name('Billing::Boleto').dependent(:destroy) }

    it { is_expected.to have_many(:items).class_name('Billing::PaymentItem').dependent(:destroy) }
    it { is_expected.to have_many(:processing_fees).class_name('Billing::ProcessingFee').dependent(:destroy) }
    it { is_expected.to have_many(:gateway_payables).class_name('Billing::GatewayPayable').dependent(:destroy) }
  end

  describe 'Configurations' do
    it 'setups payment_method with Billing::PaymentMethods enum' do
      expect(described_class.enumerations).to include(payment_method: Billing::PaymentMethods)
    end

    it 'setups gateway with Billing::Gateways enum' do
      expect(described_class.enumerations).to include(gateway: Billing::Gateways)
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:billing_address_id) }
    it { is_expected.to validate_presence_of(:payment_method) }
    it { is_expected.to validate_presence_of(:gateway) }

    it do
      payment = create(:billing_payment)
      expect(payment).to validate_uniqueness_of(:gateway_id).scoped_to(:gateway)
    end

    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
    it { is_expected.to validate_numericality_of(:shipping_fee).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:payment_method_fee).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than_or_equal_to(1) }

    context 'when payment method is credit card' do
      subject(:payment) { described_class.new(payment_method: Billing::PaymentMethods::CREDIT_CARD) }

      it { is_expected.to validate_numericality_of(:installments_count).is_greater_than(0) }
    end

    context 'when payment method isn`t credit card' do
      subject(:payment) { described_class.new(payment_method: payment_methods.sample) }

      let(:payment_methods) { Billing::PaymentMethods.list - [Billing::PaymentMethods::CREDIT_CARD] }

      it { is_expected.to validate_numericality_of(:installments_count).is_equal_to(1) }
    end

    context 'when total amount cents represents sum of amount and fees' do
      subject(:payment) do
        described_class.new(total_amount: 50, amount: 20, shipping_fee: 20, payment_method_fee: 10)
      end

      it 'doesn`t add invalid_total_amount error' do
        payment.valid?

        expect(payment.errors[:total_amount_cents]).to be_empty
      end
    end

    context 'when total amount cents doesn`t represent sum of amount and fees' do
      subject(:payment) do
        described_class.new(total_amount: 50, amount: 10, shipping_fee: 10, payment_method_fee: 10)
      end

      it 'adds invalid total amount error message' do
        payment.valid?

        error_message = I18n.t('models.billing.payment.errors.invalid_total_amount')
        expect(payment.errors[:total_amount_cents]).to include error_message
      end
    end
  end

  describe 'Delegations' do
    %i[
      wait_payment! authorize! settle! refuse! approve_on_antifraud! decline_on_antifraud! wait_review! refund!
      chargeback!
    ].each do |method|
      it { is_expected.to delegate_method(method).to(:state_machine) }
    end
  end
end
