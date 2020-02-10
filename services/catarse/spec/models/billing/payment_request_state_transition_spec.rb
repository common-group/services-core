require 'rails_helper'

RSpec.describe Billing::PaymentRequestStateTransition, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment_request).class_name('Billing::PaymentRequest') }
  end

  describe 'Indexes' do
    it { is_expected.to have_db_index(:payment_request_id).unique(false) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_request_id) }

    it do
      is_expected.to validate_inclusion_of(:to_state)
        .in_array(Billing::PaymentRequest.aasm.states.map(&:name).map(&:to_s))
    end

    it do
      is_expected.to validate_inclusion_of(:from_state)
        .in_array(Billing::PaymentRequest.aasm.states.map(&:name).map(&:to_s)).allow_nil
    end
  end
end
