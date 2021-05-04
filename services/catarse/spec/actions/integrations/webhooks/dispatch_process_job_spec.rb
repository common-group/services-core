# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::Webhooks::DispatchProcessJob, type: :action do
  describe 'inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(webhook: { type: Integrations::Webhook }) }
  end

  describe 'outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    subject(:result) { described_class.result(webhook: webhook) }

    let(:webhook) { Integrations::Webhook.new(id: Faker::Internet.uuid) }

    it { is_expected.to be_success }

    it 'dispatches process webhook job' do
      expect(Integrations::ProcessWebhookJob).to receive(:perform_later).with(webhook.id)

      result
    end
  end
end
