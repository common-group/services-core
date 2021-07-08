# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Tiers::List, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to include(project_id: { type: String }) }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(tiers: { type: Enumerable }) }
  end

  describe '#call' do
    subject(:result) { described_class.result(project_id: project_id) }

    context 'when project exists' do
      let(:project) { create(:project) }
      let!(:tiers) { create_list(:membership_tier, 3, project: project) }
      let(:project_id) { project.id.to_s }

      it { is_expected.to be_success }

      it 'returns project`s tiers list' do
        expect(result.tiers.to_a).to match_array tiers
      end
    end

    context 'when project doesn`t exist' do
      let(:project_id) { 'not-found' }

      it { expect { result }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
