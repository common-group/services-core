# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payment, type: :model do
  it_behaves_like 'has state machine' do
    let(:record) { create(:simple_payment) }
  end

  describe 'Relations' do
    subject(:payment) { described_class.new }

    it { is_expected.to belong_to :user }
    it { is_expected.to belong_to(:shipping_address).class_name('Common::Address').optional }
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
    it { is_expected.to validate_presence_of(:payment_method) }
    it { is_expected.to validate_presence_of(:gateway) }

    it do
      payment = create(:credit_card_payment)
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

    context 'when credit card owner matches user' do
      subject(:payment) do
        described_class.new(user: user, credit_card: credit_card, payment_method: Billing::PaymentMethods::CREDIT_CARD)
      end

      let(:user) { User.new(id: 1) }
      let(:credit_card) { Billing::CreditCard.new(user: user) }

      it 'doesn`t add invalid_credit_card error' do
        payment.valid?

        expect(payment.errors[:credit_card_id]).to be_empty
      end
    end

    context 'when credit card owner doesn`t match user' do
      subject(:payment) do
        described_class.new(
          user: User.new(id: 2),
          credit_card: credit_card,
          payment_method: Billing::PaymentMethods::CREDIT_CARD
        )
      end

      let(:credit_card) { Billing::CreditCard.new(user: User.new(id: 1)) }

      it 'adds invalid credit card error message' do
        payment.valid?

        error_message = I18n.t('models.billing.payment.errors.invalid_credit_card')
        expect(payment.errors[:credit_card_id]).to include error_message
      end
    end

    context 'when pay in installment items that cannot be paid in installment' do
      subject(:payment) { build(:billing_payment, :credit_card, :subscription, installments_count: 2) }

      it 'adds error message to items' do
        payment.valid?

        error_message = I18n.t('models.billing.payment.errors.has_items_that_cannot_be_paid_in_installments')
        expect(payment.errors[:items]).to include error_message
      end
    end

    context 'when pay in installment items that can be paid in installment' do
      subject(:payment) { build(:billing_payment, :credit_card, :contribution, installments_count: 2) }

      it 'doesn`t add error to items' do
        payment.valid?

        expect(payment.errors[:items]).to be_empty
      end
    end
  end

  describe 'Delegations' do
    %i[
      wait_payment! authorize! settle! refuse! approve_on_antifraud! decline_on_antifraud! wait_review! refund!
      chargeback! expire!
    ].each do |method|
      it { is_expected.to delegate_method(method).to(:state_machine) }
    end
  end
end
