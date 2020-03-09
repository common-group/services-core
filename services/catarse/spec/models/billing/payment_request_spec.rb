require 'rails_helper'

RSpec.describe Billing::PaymentRequest, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:billing_address).class_name('Address') }

    it do
      is_expected.to have_many(:state_transitions)
        .class_name('Billing::PaymentRequestStateTransition')
        .dependent(:destroy)
    end

    it do
      is_expected.to have_many(:items)
        .class_name('Billing::PaymentRequestItem')
        .dependent(:destroy)
    end

    it { is_expected.to have_one(:credit_card).class_name('Billing::CreditCard').dependent(:destroy) }
    it { is_expected.to have_one(:bank_slip).class_name('Billing::BankSlip').dependent(:destroy) }
  end

  describe 'Indexes' do
    it { is_expected.to have_db_index(:user_id).unique(false) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:billing_address_id) }
    it { is_expected.to validate_presence_of(:total_amount) }
    it { is_expected.to validate_presence_of(:payment_method) }
    it { is_expected.to validate_presence_of(:installments_count) }
    it { is_expected.to validate_presence_of(:state) }

    context 'when is a bank slip payment request' do
      before { subject.payment_method = :bank_slip }

      it { is_expected.to validate_absence_of(:gateway_card_id) }
      it { is_expected.to validate_absence_of(:gateway_card_hash) }

      it { is_expected.to validate_numericality_of(:installments_count).is_equal_to(1) }

      it 'doesn`t validate presence of a least one of gateway_card_id or gateway_card_hash' do
        subject.gateway_card_id = nil
        subject.gateway_card_hash = nil
        subject.validate
        expect(subject.errors[:base]).to be_empty
      end
    end

    context 'when is a credit card payment request' do
      before { subject.payment_method = :credit_card }

      it { is_expected.to_not validate_absence_of(:gateway_card_id) }
      it { is_expected.to_not validate_absence_of(:gateway_card_hash) }

      it { is_expected.to validate_numericality_of(:installments_count).is_greater_than(0).is_less_than_or_equal_to(6) }

      it 'validates presence of a least one of gateway_card_id or gateway_card_hash' do
        subject.gateway_card_id = nil
        subject.gateway_card_hash = nil
        subject.validate
        expect(subject.errors[:base]).to include('at least one of gateway_card_id or gateway_card_hash should be present')
      end
    end

    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than(0) }

    it { is_expected.to validate_inclusion_of(:state).in_array(described_class.aasm.states.map(&:name).map(&:to_s)) }
  end

end
