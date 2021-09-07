# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::CreditCards::SafelistQuery, type: :query do
  subject(:query) { described_class.new }

  describe '#call' do
    let!(:payment) { create(:credit_card_payment, :paid) }

    before do
      not_paid_states = Billing::PaymentStateMachine.states - ['paid']
      not_paid_states.each do |state|
        create(:credit_card_payment, state: state)
      end
    end

    it 'returns credit cards used on paid payments' do
      expect(query.call).to eq [payment.credit_card]
    end
  end
end
