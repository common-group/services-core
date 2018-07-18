require 'rails_helper'

RSpec.describe V1::Projects::GoalsController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }
  let(:user) { create(:user, platform: platform) }
  let(:another_user) { create(:user, platform: platform) }
  let(:current_user) { user }
  let(:token_role) { 'platform_user' }

  before do
    allow(controller).to receive(:decoded_api).and_return({user_id: user.id, role: token_role, platform_token: platform.token}.stringify_keys)
  end

  describe '#create' do
    let(:project) { create(:project, user_id: current_user.id) }
    let(:goal) { build(:goal, project: project) }


    context 'without user' do
      before do
        allow(controller).to receive(:decoded_api).and_return(nil)
        post :create, params: { project_id: goal.project_id, goal: goal.attributes.compact["data"] }
      end

      it 'should be 403' do
        expect(response.code).to eq("403")
      end
    end

    context 'with platform_user from another platform' do
    end

    context 'with platform_user from current_platform' do
      context 'with valid attributes' do
        it 'creates a new goal' do
          expect {
            post :create, params: { project_id: goal.project_id, goal: goal.attributes.compact["data"] }
          }.to change(CommonModels::Goal, :count).by(1)
        end
      end
    end

    context 'with scoped_user not owner of project' do
    end

    context 'with scoped_user owner of project' do
    end
  end
end
