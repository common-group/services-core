require 'rails_helper'

RSpec.describe V1::Projects::GoalsController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }
  let(:user) { create(:user, platform: platform) }
  let(:another_user) { create(:user, platform: platform) }
  let(:current_user) { user }
  let(:token_role) { 'scoped_user' }

  before do
    allow(controller).to receive(:decoded_api).and_return({user_id: user.id, role: token_role, platform_token: platform.token}.stringify_keys)
  end

  describe 'POST #create' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:goal) { build(:goal, project: project, platform: platform) }

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
    end

    context 'with scoped_user not owner of project' do
    end

    context 'with scoped_user owner of project' do
      let(:goal_params) { { title: 'foo' } }

      before do
        post :create, params: { project_id: goal.project_id, goal: goal_params }
      end

      context 'with missing attributes' do
        it 'should be invalid request and return error validation messages' do
          json = JSON.parse(response.body).deep_symbolize_keys
          expect(response.code).to eq("400")

          expect(json[:description]).to eq(["can't be blank"])
          expect(json[:value]).to eq(["can't be blank"])
        end
      end

      context 'with valid attributes' do
        let(:goal_params) { goal.attributes.compact["data"] }
        it 'creates a new goal' do
          json = JSON.dump(response.body)
          expect(json['goal_id']).to_not be_nil
        end
      end
    end
  end
end
