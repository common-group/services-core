# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payment, type: :model do
  describe 'Relations' do
    subject(:payment) { described_class.new }

    it { is_expected.to belong_to :user }
    it { is_expected.to belong_to(:billing_address).class_name('Shared::Address') }
    it { is_expected.to belong_to(:shipping_address).class_name('Shared::Address').optional }

    it { is_expected.to have_many(:items).class_name('Billing::PaymentItem').dependent(:destroy) }

    it do
      expect(payment).to have_many(:state_transitions)
        .class_name('Billing::PaymentStateTransition')
        .dependent(:destroy)
        .autosave(false)
    end
  end

  describe 'Configurations' do
    it 'setups payment_method with Billing::PaymentMethods enum' do
      expect(described_class.enumerations).to include(payment_method: Billing::PaymentMethods)
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:billing_address_id) }
    it { is_expected.to validate_presence_of(:payment_method) }
    it { is_expected.to validate_presence_of(:state) }
    it { is_expected.to validate_presence_of(:gateway) }

    it do
      payment = create(:billing_payment)
      expect(payment).to validate_uniqueness_of(:gateway_id).scoped_to(:gateway)
    end

    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than_or_equal_to(1) }

    it { is_expected.to validate_inclusion_of(:state).in_array(Billing::PaymentStateMachine.states) }
  end

  describe 'Callbacks' do
    describe '#after_create' do
      it 'creates a state transition' do
        payment = create(:billing_payment)

        expect(payment.state_transitions.last.attributes).to include(
          'to_state' => payment.state, 'sort_key' => 1, 'most_recent' => true
        )
      end
    end
  end
end
