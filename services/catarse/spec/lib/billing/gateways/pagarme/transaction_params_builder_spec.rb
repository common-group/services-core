require 'rails_helper'

RSpec.describe Billing::Gateways::Pagarme::TransactionParamsBuilder, type: :lib do
  subject { described_class.new(payment_request) }

  describe 'Public methods' do
    describe '#build' do
      before { allow(subject).to receive(:postback_url).and_return('http://postback.url') }

      context 'when is a credit card payment request' do
        let(:payment_request) { create(:payment_request, :credit_card) }

        it 'build params with credit card relative data' do
          expect(subject.build).to include(
            reference_key: payment_request.id,
            amount: (payment_request.total_amount * 100).to_i,
            async: false,
            installments: payment_request.installments_count,
            postback_url: 'http://postback.url',
            payment_method: 'credit_card',
            capture: false,
            soft_descriptor: 'Catarse'
          )
        end

        context 'when payment request has gateway card id' do
          let(:payment_request) { create(:payment_request, :credit_card, gateway_card_hash: nil) }

          it 'builds params with card_id' do
            expect(subject.build[:card_id]).to eq payment_request.gateway_card_id
          end
        end

        context 'when payment request has gateway card hash' do
          let(:payment_request) { create(:payment_request, :credit_card, gateway_card_id: nil) }

          it 'builds params with card_hash' do
            expect(subject.build[:card_hash]).to eq payment_request.gateway_card_hash
          end
        end
      end

      context 'when is a bank slip payment request' do
        let(:payment_request) { create(:payment_request, :bank_slip) }

        it 'builds params with bank slip relative data' do
          expect(subject.build).to eq(
            reference_key: payment_request.id,
            amount: (payment_request.total_amount * 100).to_i,
            async: false,
            installments: payment_request.installments_count,
            postback_url: 'http://postback.url',
            payment_method: 'boleto',
            boleto_expiration_date: 2.business_days.from_now.to_date,
            customer: {
              name: payment_request.user.name,
              document: payment_request.user.cpf
            }
          )
        end
      end

      context 'when is a unknown payment method' do
        let(:payment_request) { double(credit_card?: false, bank_slip?: false) }
        it 'raises error' do
          expect { subject.build }.to raise_error('Unknown payment method')
        end
      end
    end
  end

  describe 'Private methods' do
    describe '#postback_url' do
      let(:payment_request) { double }

      before { allow(CatarseSettings).to receive(:get_without_cache).with(:host).and_return('host.com') }

      context 'when is production environment' do
        before { allow(Rails).to receive_message_chain('env.production?').and_return(true) }

        it 'returns url with www subdomain' do
          expect(subject.send(:postback_url)).to eq 'https://www.host.com/v2/integrations/webhooks/pagarme'
        end
      end

      context 'when isn`t production environment' do
        before { allow(Rails).to receive_message_chain('env.production?').and_return(false) }

        it 'returns url with sandbox subdomain' do
          expect(subject.send(:postback_url)).to eq 'https://sandbox.host.com/v2/integrations/webhooks/pagarme'
        end
      end
    end
  end
end
