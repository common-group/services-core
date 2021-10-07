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
    let(:payment) { build(:simple_payment, user: user) }
    let(:attributes) { Hash[*Faker::Lorem.words(number: 8)] }
    let(:payment_builder) { instance_double(Billing::PaymentBuilder) }

    before do
      allow(Billing::PaymentBuilder).to receive(:new).and_return(payment_builder)
      allow(payment_builder).to receive(:build).and_return(payment)
    end

    it 'builds payment with Billing::PaymentBuilder' do
      expect(result.payment).to equal(payment)
    end

    context 'when built payment is valid' do
      it { is_expected.to be_success }

      it 'saves payment' do
        expect(result.payment).to be_persisted
      end
    end

    context 'when built payment is invalid' do
      before { payment.user = nil }

      it 'raises error' do
        expect { result }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it 'rollbacks transaction' do
        expect do
          result
        rescue ActiveRecord::RecordInvalid
          # do nothing
        end.not_to change(Common::Address, :count)
      end
    end
  end
end
