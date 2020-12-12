# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContributionDetailDecorator do
  include Draper::LazyHelpers

  let(:value) { 10 }
  let(:contribution) { create(:confirmed_contribution, value: value) }
  let(:payment) { contribution.payments.last }
  let(:detail) { contribution.details.ordered.last }

  before do
    I18n.locale = :pt
  end

  describe '#display_installments_details' do
    subject { detail.decorate.display_installment_details }
    context 'when I have 1 installment' do
      before do
        payment.update installments: 1
      end
      it { is_expected.to eq '' }
    end

    context 'when I have >1 installment' do
      before do
        payment.update installments: 2, installment_value: 10
      end
      it { is_expected.to eq "#{payment.installments} x #{number_to_currency payment.installment_value}" }
    end
  end

  describe '#display_payment_details' do
    subject { detail.decorate.display_payment_details }
    context 'when contribution is made with credits' do
      before do
        payment.update gateway: 'Credits'
      end
      it { is_expected.to eq I18n.t('contribution.payment_details.creditos') }
    end

    context 'when contribution is not made with credits' do
      before do
        payment.update gateway: 'Pagarme', payment_method: 'CartaoDeCredito'
      end
      it { is_expected.to eq I18n.t('contribution.payment_details.cartao_de_credito') }
    end
  end

  describe '#display_value' do
    subject { detail.decorate.display_value }

    context 'when the value has decimal places' do
      let(:value) { 99.99 }
      it { is_expected.to eq('R$ 99,99') }
    end

    context 'when the value does not have decimal places' do
      it { is_expected.to eq('R$ 10,00') }
    end
  end

  describe '#display_status' do
    subject { detail.decorate.display_status }

    context 'when payment is paid' do
      before do
        payment.update paid_at: Time.current
      end
      it {
        date = detail.paid_at.to_date
        is_expected.to eq I18n.t("payment.state.#{payment.state}", date: I18n.l(date))
      }
    end

    context 'when payment is pending' do
      let(:contribution) { create(:pending_contribution) }
      it { is_expected.to eq I18n.t("payment.state.#{payment.state}", date: nil) }
    end
  end

  describe '#display_slip_url' do
    let(:contribution) { create(:confirmed_contribution) }
    context 'when slip_url is filled' do
      before do
        payment.update gateway_data: { boleto_url: 'http://foo.bar/' }
      end

      subject { detail.decorate.display_slip_url }
      it { is_expected.to eq('http://foo.bar/') }
    end
  end
end
