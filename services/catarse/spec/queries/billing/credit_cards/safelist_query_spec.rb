# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::CreditCards::SafelistQuery, type: :query do
  subject(:query) { described_class.new }

  describe '#call' do
    let!(:payment) { create(:billing_payment, :paid, :with_credit_card) }

    before do
      not_paid_states = Billing::PaymentStateMachine.states - ['paid']
      not_paid_states.each do |state|
        create(:billing_payment, :with_credit_card, state: state)
      end
    end

    it 'returns credit cards used on paid payments' do
      expect(query.call).to eq [payment.credit_card]
    end
  end
end
