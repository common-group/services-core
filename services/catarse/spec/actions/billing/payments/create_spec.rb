# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::Create, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(user: { type: User }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(user: user, attributes: attributes) }

    let(:user) { create(:user) }
    let(:payment) { build(:billing_payment) }
    let(:contribution_a) { create(:contribution, user: user, shipping_fee: create(:shipping_fee)) }
    let(:contribution_b) { create(:contribution, user: user) }
    let(:attributes) do
      {
        payment_method: payment.payment_method,
        gateway: payment.gateway,
        billing_address_id: create(:shared_address).id,
        payables: [
          { id: contribution_a.id, type: 'Contribution' },
          { id: contribution_b.id, type: 'Contribution' }
        ]
      }
    end

    it { is_expected.to be_success }

    it 'creates payment' do
      expect(result.payment.reload.attributes).to include(
        'user_id' => user.id,
        'payment_method' => attributes[:payment_method],
        'gateway' => attributes[:gateway],
        'billing_address_id' => attributes[:billing_address_id],
        'state' => Billing::PaymentStateMachine.initial_state,
        'total_amount_cents' => result.payment.items.sum(:total_amount_cents)
      )
    end

    it 'creates first payment item' do
      created_payment = result.payment

      payment_item_a = created_payment.items.find_by!(payable: contribution_a)

      amount_cents = (contribution_a.value * 100).to_i
      shipping_fee_cents = (contribution_a.shipping_fee.value.to_f * 100).to_i

      expect(payment_item_a.attributes).to include(
        'amount_cents' => amount_cents,
        'shipping_fee_cents' => shipping_fee_cents,
        'total_amount_cents' => amount_cents + shipping_fee_cents,
        'state' => Billing::PaymentItemStateMachine.initial_state
      )
    end

    it 'creates second payment item' do
      created_payment = result.payment

      payment_item_a = created_payment.items.find_by!(payable: contribution_b)

      amount_cents = (contribution_b.value * 100).to_i

      expect(payment_item_a.attributes).to include(
        'amount_cents' => amount_cents,
        'shipping_fee_cents' => 0,
        'total_amount_cents' => amount_cents,
        'state' => Billing::PaymentItemStateMachine.initial_state
      )
    end
  end
end
