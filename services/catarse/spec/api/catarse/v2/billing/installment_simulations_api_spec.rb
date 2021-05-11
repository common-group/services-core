# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Billing::InstallmentSimulationsAPI, type: :api do
  describe 'POST /v2/billing/installment_simulations' do
    let(:params) do
      { 'total_amount_cents' => Faker::Number.number(digits: 4) }
    end

    before do
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_max_installments).and_return(6)
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_interest_rate).and_return(2.5)
      allow(CatarseSettings).to receive(:get_without_cache)
        .with(:pagarme_minimum_value_for_installment).and_return(15)
    end

    context 'when the amount is greater than the minimum amount for installation' do
      it 'returns installment_simulations' do
        get '/v2/billing/installment_simulations', params: params
        result = Billing::InstallmentSimulator.new.calculate(params['total_amount_cents']).to_json

        expect(response.body).to eq(result)
      end
    end

    context 'when the amount is less than the minimum amount for installation' do
      it 'returns installment_simulations' do
        get '/v2/billing/installment_simulations', params: { 'total_amount_cents' => 1000 }
        expected_response = { installments_count: 1, total_amount_cents: 1000, installment_amount_cents: 1000 }

        expect(response.body).to eq([expected_response].to_json)
      end
    end

    it 'return status 200 - ok' do
      get '/v2/billing/installment_simulations', params: params

      expect(response).to have_http_status(:ok)
    end
  end
end
