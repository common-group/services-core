# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::Projects::GoalsController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }

  let(:user) { create(:user, platform: platform) }
  let(:admin_user) { create(:user, platform: platform) }
  let(:another_platform_user) { create(:user, platform: another_platform) }

  let(:current_user) { user }
  let(:token_role) { 'scoped_user' }
  let(:platform_token) { platform.token }
  let(:user_id) { current_user.id }

  before do
    allow(controller).to receive(:decoded_api) do
      { user_id: user_id,
        role: token_role,
        platform_token: platform_token }.stringify_keys
    end
  end

  describe 'POST #create' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:goal) { build(:goal, project: project, platform: platform) }

    subject { response }

    context 'with role anonymous' do
      before do
        allow(controller).to receive(:decoded_api).and_return(nil)
        allow(controller).to receive(:platform_token).and_return(platform.token)

        post :create, params: { project_id: goal.project_id, goal: goal.attributes.compact["data"] }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with role platform_user from another platform' do
      let(:platform_token) { another_platform.token }
      let(:user_id) { nil }
      let(:token_role) { 'platform_user' }

      it do
        expect {
          post :create, params: { project_id: goal.project_id, goal: goal.attributes.compact["data"] }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      let(:token_role) { 'platform_user' }
      let(:user_id) { nil }
      let(:goal_params) { goal.attributes.compact["data"] }

      before do
        post :create, params: { project_id: goal.project_id, goal: goal_params }
      end

      it 'should create a new goal' do
        json = JSON.dump(response.body)
        expect(response.code).to eq("200")
        expect(json['goal_id']).to_not be_nil
      end
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
        it 'should create a new goal' do
          json = JSON.dump(response.body)
          expect(response.code).to eq("200")
          expect(json['goal_id']).to_not be_nil
        end
      end
    end
  end
end
