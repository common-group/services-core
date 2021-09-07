# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::OverdueQuery, type: :query do
  subject(:query) { described_class.new }

  describe '#call' do
    let!(:payment_with_pix) { create(:pix_payment, :waiting_payment) }
    let!(:payment_with_boleto) { create(:boleto_payment, :waiting_payment) }

    before do
      payment_with_boleto.boleto.update!(expires_on: '2021-01-01')
      payment_with_pix.pix.update!(expires_on: '2021-01-01')

      Billing::PaymentStateMachine.states.each do |state|
        create(:boleto_payment, state: state)
        create(:pix_payment, state: state)
        create(:credit_card_payment, state: state)
      end
    end

    it 'returns payments that can be expired' do
      expect(query.call).to contain_exactly(payment_with_pix, payment_with_boleto)
    end
  end
end
