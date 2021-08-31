# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CreateProjectFiscalToProjectSubAction, type: :action do
  let(:value) { 700 }

  describe '#call' do
    subject(:result) do
      described_class.new(
        project_id: subscription_project.id,
        month: Time.zone.now.month,
        year: Time.zone.now.year
      ).call
    end

    let(:subscription_project) { create(:subscription_project, state: 'online') }
    let(:contribution) do
      [
        create(:confirmed_contribution, value: value, project: subscription_project),
        create(:confirmed_contribution, value: value, project: subscription_project),
        create(:confirmed_contribution, value: value, project: subscription_project,
          created_at: Time.zone.now - 60.days
        ),
        create(:contribution, value: value, project: subscription_project)
      ]
    end
    let!(:payment) do
      [
        contribution[0].payments.last,
        contribution[1].payments.last,
        contribution[2].payments.last,
        create(:payment, state: 'chargeback', contribution: contribution[3],
          value: value, created_at: Time.zone.yesterday
        )
      ]
    end
    let!(:antifraud) do
      [
        create(:antifraud_analysis, payment: payment[0], created_at: Time.zone.yesterday),
        create(:antifraud_analysis, payment: payment[1], created_at: Time.zone.yesterday),
        create(:antifraud_analysis, payment: payment[2], created_at: Time.zone.now - 60.days),
        create(:antifraud_analysis, payment: contribution[3].payments.last, created_at: Time.zone.yesterday)
      ]
    end

    before do
      contribution[0].user.update(account_type: 'pj')
      contribution[1].user.update(account_type: 'pf')
      contribution[0].payments.last.update(created_at: Time.zone.yesterday)
      contribution[1].payments.last.update(created_at: Time.zone.yesterday)
      contribution[2].payments.last.update(created_at: Time.zone.now - 60.days)
    end

    it 'returns project fiscals attributes' do
      expect(result.attributes).to include(
        'user_id' => subscription_project.user_id,
        'project_id' => subscription_project.id,
        'total_irrf_cents' => (0.015 * payment[1].value).to_i,
        'total_amount_to_pj_cents' => payment[0].value.to_i,
        'total_amount_to_pf_cents' => payment[1].value.to_i,
        'total_catarse_fee_cents' => (subscription_project.service_fee * (payment[0].value + payment[1].value)).to_i,
        'total_gateway_fee_cents' => (payment[0].gateway_fee + payment[1].gateway_fee).to_i,
        'total_antifraud_fee_cents' => (antifraud[0].cost + antifraud[1].cost).to_i,
        'total_chargeback_cost_cents' => (payment[2].gateway_fee + antifraud[2].cost).to_i
      )
    end
  end
end
