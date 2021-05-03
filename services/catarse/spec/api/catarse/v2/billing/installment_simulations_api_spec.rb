# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Billing::InstallmentSimulationsAPI, type: :api do
  describe 'POST /v2/billing/installment_simulations' do
    let(:installment_simulations_params) do
      { 'total_amount_cents' => Faker::Number.number(digits: 4) }
    end

    before do
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_max_installments).and_return(6)
      allow(CatarseSettings).to receive(:get_without_cache).with(:pagarme_interest_rate).and_return(2.5)
    end

    it 'returns installment_simulations' do
      post '/v2/billing/installment_simulations', params: { installment_simulations: installment_simulations_params }
      result = Billing::Installments.calculate(installment_simulations_params['total_amount_cents']).to_json

      expect(response.body).to eq(result)
    end

    it 'return status 201 - created' do
      post '/v2/billing/installment_simulations', params: { installment_simulations: installment_simulations_params }

      expect(response).to have_http_status(:created)
    end
  end
end
