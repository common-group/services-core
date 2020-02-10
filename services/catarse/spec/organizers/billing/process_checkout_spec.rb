require 'rails_helper'

RSpec.describe Billing::ProcessCheckout, type: :organizer do
  let(:context) { LightService::Context.make(user: user, payment_request_attributes:payment_request_attributes) }
  let(:user) { double }
  let(:payment_request_attributes) { double }

  before do
    allow(Billing::CreatePaymentRequestAction).to receive(:execute)
      .with(context)
      .and_return(context)
  end

  it 'calls create payment request action' do
    result = described_class.call(user: user, payment_request_attributes: payment_request_attributes)
    expect(result).to eq context
  end
end
