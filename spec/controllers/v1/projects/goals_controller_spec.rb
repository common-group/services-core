require 'rails_helper'

RSpec.describe V1::Projects::GoalsController, type: :controller do
  let(:user) { create(:user) }
  let(:current_user) { user }

  before do
    allow(controller).to receive(:current_user).and_return(current_user)
  end

  describe '#create' do
    let(:project) { create(:project, user_id: current_user.id) }
    let(:goal) { build(:goal, project: project) }

    context 'with valid attributes' do
      it 'creates a new goal' do
        expect {
          post :create, format: :json, project_id: goal.project_id, goal: goal.attributes.compact
        }.to change(Goal, :count).by(1)
      end
    end
  end
end
