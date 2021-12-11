# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Tiers::Create, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(project_id: { type: Integer }) }
    it { is_expected.to include(attributes: { type: Hash }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(tier: { type: Membership::Tier }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(project_id: project.id, attributes: attributes) }

    let(:project) { create(:subscription_project) }

    context 'when attributes are valid' do
      let(:attributes) { attributes_for(:membership_tier).merge(project_id: project.id) }

      it { is_expected.to be_success }

      it 'creates tier for given project' do
        expect { result }.to change(project.tiers, :count).by(1)
      end

      it 'creates tier with given attribute' do
        expect(result.tier.attributes).to include(attributes.stringify_keys)
      end
    end

    context 'when attributes are invalid' do
      let(:attributes) { { name: nil } }

      it { expect { result }.to raise_error(ActiveRecord::RecordInvalid) }
    end
  end
end
