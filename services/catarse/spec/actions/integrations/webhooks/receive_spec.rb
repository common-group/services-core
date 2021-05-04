# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations::Webhooks::Receive, type: :action do
  describe 'Inputs' do
    subject(:inputs) { described_class.inputs }

    it { is_expected.to be_empty }
  end

  describe 'Outputs' do
    subject(:outputs) { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe 'Play actors' do
    subject(:play_actors) { described_class.play_actors.pluck(:actor) }

    let(:expected_actors) do
      [
        Integrations::Webhooks::ValidateSignature,
        Integrations::Webhooks::Create,
        Integrations::Webhooks::DispatchProcessJob
      ]
    end

    it { is_expected.to eq expected_actors }
  end
end
