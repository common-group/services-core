# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectIndexAction, type: :action do
  let(:hits) { ['attributes' => { 'id' => '47654' }] }

  before do
    allow(ProjectsIndex).to receive(:query).with(match: { project_id: project.id }).and_return(hits)
  end

  describe '#call' do
    subject(:result) { described_class.new(project_id: project.id, user: user).call }

    let!(:user) { create(:user) }
    let!(:project) { create(:project, user: user) }

    context 'when project_index attributes is present' do
      it 'returns add new attributes' do
        expect(result).to eq(
          {
            'id' => '47654',
            'contributed_by_friends' => false,
            'in_reminder' => false,
            'saved_projects' => false,
            'admin_tag_list' => nil,
            'admin_notes' => nil,
            'can_cancel' => true
          }
        )
      end
    end

    context 'when project_index attributes isn`t present' do
      let(:hits) { [{}] }

      before do
        allow(ProjectsIndex).to receive(:query).with(match: { project_id: project.id }).and_return(hits)
      end

      it 'returns nil' do
        expect(result).to eq({})
      end
    end

    context 'when project_index returns error' do
      before do
        allow(ProjectsIndex).to receive(:query)
          .with(match: { project_id: project.id })
          .and_return(RuntimeError.new('Error'))
      end

      it 'capture message via Sentry' do
        expect(Sentry).not_to receive(:capture_message)

        result
      end
    end
  end

  describe '#contributed_by_friends' do
    subject(:result) { described_class.new(project_id: project.id, user: user).send(:contributed_by_friends) }

    let!(:user_friend) { create(:user) }
    let!(:user_project) { create(:user) }
    let!(:project) { create(:project, user: user_project) }

    before do
      create(:confirmed_contribution, project_id: project.id, user: user_friend)
      create(:user_follow, user: user_project, follow: user_friend)
    end

    context 'when user is admin' do
      let(:user) { create(:user, admin: true) }

      it 'returns contributed_by_friends as true' do
        expect(result).to eq true
      end
    end

    context 'when user is owner' do
      let(:user) { user_project }

      it 'returns contributed_by_friends as true' do
        expect(result).to eq true
      end
    end

    context 'when user isn`t owner' do
      let(:user) { create(:user) }

      it 'returns contributed_by_friends as false' do
        expect(result).to eq false
      end
    end
  end

  describe '#in_reminder' do
    subject(:result) { described_class.new(project_id: project.id, user: user).send(:in_reminder) }

    let(:user_project) { create(:user) }
    let(:project) { create(:project, user: user_project) }

    before do
      create(:project_notification, template_name: 'reminder', project_id: project.id, user: user_project)
    end

    context 'when user is admin' do
      let(:user) { create(:user, admin: true) }

      it 'returns in_reminder as true' do
        expect(result).to eq true
      end
    end

    context 'when user is owner' do
      let(:user) { user_project }

      it 'returns in_reminder as true' do
        expect(result).to eq true
      end
    end

    context 'when user isn`t owner' do
      let(:user) { create(:user) }

      it 'returns in_reminder as false' do
        expect(result).to eq false
      end
    end
  end

  describe '#saved_projects' do
    subject(:result) { described_class.new(project_id: project.id, user: user).send(:saved_projects) }

    let(:user_project) { create(:user) }
    let(:project) { create(:project, user: user_project) }

    before do
      create(:project_reminder, project_id: project.id, user: user_project)
    end

    context 'when user is admin' do
      let(:user) { create(:user, admin: true) }

      it 'returns saved_projects as true' do
        expect(result).to eq true
      end
    end

    context 'when user is owner' do
      let(:user) { user_project }

      it 'returns saved_projects as true' do
        expect(result).to eq true
      end
    end

    context 'when user isn`t owner' do
      let(:user) { create(:user) }

      it 'returns saved_projects as false' do
        expect(result).to eq false
      end
    end
  end

  describe '#admin_tag_list' do
    subject(:result) { described_class.new(project_id: project.id, user: user).send(:admin_tag_list) }

    let(:project) { create(:project) }
    let(:tag) { create(:tag) }

    before do
      create(:tagging, tag: tag, project: project)
    end

    context 'when user is admin' do
      let(:user) { create(:user, admin: true) }

      it 'returns admin_tag_list' do
        expect(result).to eq %(\"#{tag.name}\").squish
      end
    end

    context 'when user isn`t admin' do
      let(:user) { create(:user) }

      it 'returns nil' do
        expect(result).to eq nil
      end
    end
  end

  describe '#admin_notes' do
    subject(:result) { described_class.new(project_id: project.id, user: user).send(:admin_notes) }

    context 'when user is admin' do
      let(:user) { create(:user, admin: true) }
      let(:project) { create(:project, admin_notes: 'admin_notes') }

      it 'returns admin_notes' do
        expect(result).to eq 'admin_notes'
      end
    end

    context 'when user isn`t admin' do
      let(:user) { create(:user) }
      let(:project) { create(:project, user: user, admin_notes: 'admin_notes') }

      it 'returns saved_projects as nil' do
        expect(result).to eq nil
      end
    end
  end

  describe '#can_cancel' do
    subject(:result) { described_class.new(project_id: project.id, user: user).send(:can_cancel) }

    context 'when user is admin' do
      let(:project) { create(:project) }
      let(:user) { create(:user, admin: true) }

      it 'returns true' do
        expect(result).to eq true
      end
    end

    context 'when user is owner' do
      let(:user) { create(:user) }
      let(:project) { create(:project, user: user) }

      it 'returns true' do
        expect(result).to eq true
      end
    end

    context 'when user isn`t owner' do
      let(:project) { create(:project) }
      let(:user) { create(:user) }

      it 'returns false' do
        expect(result).to eq false
      end
    end
  end
end
