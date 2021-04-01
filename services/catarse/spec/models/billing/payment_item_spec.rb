# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItem, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to :payment }
    it { is_expected.to belong_to :payable }
    it { is_expected.to have_many(:state_transitions).class_name('Billing::PaymentItemStateTransition') }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of :payment_id }
    it { is_expected.to validate_presence_of :payable_id }
    it { is_expected.to validate_presence_of :payable_type }
    it { is_expected.to validate_presence_of :state }

    it do
      payment_item = create(:billing_payment_item)
      expect(payment_item).to validate_uniqueness_of(:payable_id).scoped_to(:payable_type, :payment_id)
    end

    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
    it { is_expected.to validate_numericality_of(:shipping_fee).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than_or_equal_to(1) }

    it { is_expected.to validate_inclusion_of(:state).in_array(Billing::PaymentItemStateMachine.states) }
  end

  describe 'Callbacks' do
    describe '#after_create' do
      it 'creates a state transition' do
        payment_item = create(:billing_payment_item)

        expect(payment_item.state_transitions.last.attributes).to include(
          'to_state' => payment_item.state, 'sort_key' => 1, 'most_recent' => true
        )
      end
    end
  end
end
