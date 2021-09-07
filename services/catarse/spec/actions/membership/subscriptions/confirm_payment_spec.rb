# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscriptions::ConfirmPayment, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(subscription: { type: Membership::Subscription }) }
    it { is_expected.to include(payment_item: { type: Billing::PaymentItem }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    pending 'Implement tests'
  end
end
