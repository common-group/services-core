# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::ProjectsController, type: :controller do
  describe 'routes' do
    it { should route(:post, '/v1/projects').to(action: :create) }
    it { should route(:put, '/v1/projects/10').to(action: :update, id: 10) }
  end

  describe 'filters' do
    it { should use_before_action(:authenticate_user!) }
  end

  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }

  let(:user) { create(:user, platform: platform) }
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
    let(:project) { build(:project, user_id: current_user.id, platform: platform, permalink: 'fasdflskfjl2jl') }

    subject { response }

    context 'with anonymous' do
      before do
        allow(controller).to receive(:decoded_api).and_return(nil)
        allow(controller).to receive(:platform_token).and_return(platform.token)

        post :create, params: { project: project.attributes }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from current_platform' do
      let(:token_role) { 'platform_user' }
      let(:user_id) { nil }

      before do
        post :create, params: { project: project.attributes }
      end

      it { is_expected.to have_http_status('200') }
      it 'should create a new project' do
        json = JSON.parse(response.body)
        expect(CommonModels::Project.find(json['project_id']).present?).to eq(true)
      end
    end

    context 'with scoped_user not owner of project' do
      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }

      it 'should not allowed' do
        expect {
          post :create, params: { project: project.attributes }
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'with scoped_user owner of project' do

      before do
        post :create, params: { project: project.attributes}
      end

      context 'with valid attributes' do
        it 'should create a new project' do
          json = JSON.parse(response.body)
          expect(response.code).to eq("200")
          expect(CommonModels::Project.find(json['project_id']).present?).to eq(true)
        end
      end
    end
  end

  describe 'PUT #update' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:project_params) { project.attributes }

    subject { response }

    context 'with anonymous' do
      before do
        allow(controller).to receive(:decoded_api).and_return(nil)
        allow(controller).to receive(:platform_token).and_return(platform.token)

        put :update, params: { project: project_params, id: project.id }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      let(:platform_token) { another_platform.token }
      let(:user_id) { nil }
      let(:token_role) { 'platform_user' }

      it do
        expect {
          put :update, params: { project: project_params, id: project.id }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with scoped_user not owner of project' do
      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }

      it 'should not allowed' do
        expect {
          put :update, params: { project: project_params, id: project.id }
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

  end

  describe 'DELETE #destroy' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }

    subject { response }

    context 'with anonymous' do
      before do
        allow(controller).to receive(:decoded_api).and_return(nil)
        allow(controller).to receive(:platform_token).and_return(platform.token)

        delete :destroy, params: { id: project.id }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      let(:platform_token) { another_platform.token }
      let(:user_id) { nil }
      let(:token_role) { 'platform_user' }

      it do
        expect {
          delete :destroy, params: { id: project.id }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      let(:token_role) { 'platform_user' }
      let(:user_id) { nil }

      before do
        delete :destroy, params: { id: project.id }
      end

      it { is_expected.to have_http_status('200') }

      it 'should delete project' do
        json = JSON.parse(response.body)
        expect {
          CommonModels::Project.find(json['project_id'])
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with scoped_user not owner of project' do
      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }

      it 'should not allowed' do
        expect {
          delete :destroy, params: { id: project.id }
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'with scoped_user owner of project' do
      before do
        delete :destroy, params: { id: project.id }
      end

      it 'should delete project' do
        json = JSON.parse(response.body)
        expect {
          CommonModels::Project.find(json['project_id'])
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
