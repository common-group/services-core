# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Billing::InstallmentSimulationsAPI, type: :api do
  include_examples 'authenticate routes', public_paths: ['GET /v2/billing/installment_simulations']

  describe 'POST /v2/billing/installment_simulations' do
    let(:params) do
      { 'total_amount_cents' => Faker::Number.number(digits: 4) }
    end

    before do
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_max_installments).and_return(6)
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_interest_rate).and_return(2.5)
      allow(CatarseSettings).to receive(:get_without_cache)
        .with(:pagarme_minimum_value_for_installment).and_return(1500)
    end

    it 'returns installment simulations' do
      get '/api/v2/billing/installment_simulations', params: params
      result = Billing::InstallmentCalculator.simulations(amount: params['total_amount_cents']).to_json

      expect(response.body).to eq(result)
    end

    it 'return status 200 - ok' do
      get '/api/v2/billing/installment_simulations', params: params

      expect(response).to have_http_status(:ok)
    end
  end
end
