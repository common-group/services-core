# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Unsubscribe, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to :user }
    it { is_expected.to belong_to :project }
  end

  describe '.by_project_id' do
    let(:project_01) { create(:project) }
    let(:project_02) { create(:project) }

    subject { Unsubscribe.by_project_id(project_01.id) }

    before do
      create(:unsubscribe, project: project_01)
      create(:unsubscribe, project: project_01)
      create(:unsubscribe, project: project_02)
    end

    it { expect(subject.count).to eq 2 }
  end

  describe '.drop_all_for_project' do
    let(:project_01) { create(:project) }
    let(:project_02) { create(:project) }

    subject { Unsubscribe.count }

    before do
      create(:unsubscribe, project: project_01)
      create(:unsubscribe, project: project_01)
      create(:unsubscribe, project: project_02)

      Unsubscribe.drop_all_for_project(project_01.id)
    end

    it { is_expected.to eq(1) }
  end

  describe '.posts_unsubscribe' do
    subject { Unsubscribe.posts_unsubscribe(1618) }
    it { is_expected.not_to be_persisted }
    it { expect(subject.class).to eq Unsubscribe }
    it { expect(subject.project_id).to eq 1618 }

    context 'when project_id is nil' do
      subject { Unsubscribe.posts_unsubscribe(nil) }
      it { expect(subject.class).to eq Unsubscribe }
      it { expect(subject.project_id).to be_nil }
    end
  end
end
