# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::ExpireOverduePayments, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to be_empty }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result }

    let(:scope) { instance_double(ActiveRecord::Relation) }
    let(:payment_a) { Billing::Payment.new }
    let(:payment_b) { Billing::Payment.new }

    before do
      allow(Billing::Payment).to receive(:can_be_expired).and_return(scope)
      allow(scope).to receive(:find_each).and_yield(payment_b).and_yield(payment_a)
    end

    it { is_expected.to be_success }

    it 'expires overdue payments' do
      expect([payment_a, payment_b]).to all(receive(:expire!))

      result
    end

    context 'when payment expiration raise error' do
      let(:error) { StandardError.new('some error') }

      before do
        allow(payment_a).to receive(:expire!).and_raise(error)
        allow(payment_b).to receive(:expire!)
      end

      it 'handles error with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(
          error,
          level: :fatal,
          extra: { payment_id: payment_a.id }
        )

        result
      end

      it 'doesn`t stop execution' do
        expect(payment_b).to receive(:expire!)

        result
      end
    end
  end
end
