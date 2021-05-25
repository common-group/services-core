# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Payments::AnalyzeTransaction, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to include(payment: { type: Billing::Payment }) }

    it 'injects konduto_client dependency' do
      proc = inputs.dig(:konduto_client, :default)

      expect(proc.call).to be_an_instance_of(Konduto::Client)
    end
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(payment: payment, konduto_client: konduto_client) }

    let(:payment) { create(:billing_payment, :authorized, :with_credit_card) }
    let(:konduto_client) { Konduto::Client.new }
    let(:order_params) { Konduto::ParamsBuilders::Order.new(payment: payment).build }
    let(:antifraud_response) { { 'order' => { 'recommendation' => 'APPROVE' } } }

    before do
      allow(konduto_client).to receive(:create_order).with(order_params).and_return(antifraud_response)
      allow(CatarseSettings).to receive(:get_without_cache).with(:antifraud_tax).and_return(0.3240)
    end

    context 'when payment doesn`t need analysis' do
      let(:safelist) { instance_double(ActiveRecord::Relation) }

      before do
        allow(Billing::CreditCard).to receive(:safelist).and_return(safelist)
        allow(safelist).to receive(:exists?).with(gateway_id: payment.credit_card.gateway_id).and_return(true)
      end

      it { is_expected.to be_success }

      it 'doesn`t create order on antifraud' do
        expect(konduto_client).not_to receive(:create_order)

        result
      end

      it 'doesn`t change payment state' do
        result

        expect(payment.reload).to be_in_state(:authorized)
      end
    end

    it 'creates order on konduto' do
      expect(konduto_client).to receive(:create_order).with(order_params)

      result
    end

    shared_examples 'process antifraud recommendation' do |recommendation:, action:|
      context "when konduto recommendation is #{recommendation}" do
        let(:antifraud_response) { { 'order' => { 'recommendation' => recommendation } } }

        it { is_expected.to be_success }

        it "executes #{action} on payment" do
          expect(payment).to receive(action).with(antifraud_response)

          result
        end

        it 'creates a processing fee' do
          payment_processing_fees = payment.processing_fees.where(
            vendor: Billing::ProcessingFeeVendors::KONDUTO, amount_cents: 32
          )
          expect { result }.to change(payment_processing_fees, :count).by(1)
        end
      end
    end

    include_examples 'process antifraud recommendation', recommendation: 'APPROVE', action: :approve_on_antifraud!
    include_examples 'process antifraud recommendation', recommendation: 'DECLINE', action: :decline_on_antifraud!
    include_examples 'process antifraud recommendation', recommendation: 'REVIEW', action: :wait_review!

    context 'when konduto response recommendation is NONE' do
      let(:payment) { create(:billing_payment, :refused, :with_credit_card) }
      let(:antifraud_response) { { 'order' => { 'recommendation' => 'NONE' } } }

      it { is_expected.to be_success }

      it 'doesn`t change payment state' do
        result

        expect(payment.reload).to be_in_state(:refused)
      end

      it 'doesn`t create a processing fee' do
        expect { result }.not_to change(payment.processing_fees, :count)
      end
    end

    context 'when konduto response recommendation is unexpected' do
      let(:antifraud_response) { { 'order' => { 'recommendation' => Faker::Lorem.word } } }

      it { is_expected.to be_failure }

      it 'sends message error to Sentry' do
        error_data = {
          level: :fatal, extra: { data: antifraud_response, payment_id: payment.id, user_id: payment.user_id }
        }
        expect(Sentry).to receive(:capture_message).with('Invalid antifraud request', error_data)

        result
      end
    end
  end
end
