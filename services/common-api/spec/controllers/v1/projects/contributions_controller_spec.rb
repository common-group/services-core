# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::Projects::ContributionsController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }

  let(:user) { create(:user, platform: platform) }
  let(:another_platform_user) { create(:user, platform: another_platform) }

  let(:current_user) { user }
  let(:token_role) { 'scoped_user' }
  let(:platform_token) { platform.token }
  let(:user_id) { current_user.id }
  let(:policy_model_class) { CommonModels::Contribution }
  let(:policy_scope_class) { ContributionPolicy::Scope }

  before do
    allow(controller).to receive(:decoded_api) do
      { user_id: user_id,
        role: token_role,
        platform_token: platform_token }.stringify_keys
    end
  end

  describe 'POST #create' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:contribution) { build(:contribution, project: project, user: user) }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        post :create, params: { project_id: contribution.project_id, contribution: contribution.attributes }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'

      it do
        expect {
          post :create, params: { project_id: contribution.project_id, contribution: contribution.attributes }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'
      let(:contribution_params) { contribution.attributes }

      before do
        post :create, params: { project_id: contribution.project_id, contribution: contribution_params }
      end

      it { is_expected.to have_http_status('200') }
      it 'should create a new contribution' do
        json = JSON.parse(response.body)
        expect(CommonModels::Contribution.find(json['contribution_id']).present?).to eq(true)
      end
    end

    context 'with scoped_user not owner of project' do
      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }
      let(:contribution_params) { contribution.attributes }

      it 'should be allowed' do
        expect {
          post :create, params: { project_id: contribution.project_id, contribution: contribution_params }
        }.to_not raise_error
      end
    end

    context 'with scoped_user owner of project' do
      let(:contribution_params) { { anonymous: true } }

      before do
        post :create, params: { project_id: contribution.project_id, contribution: contribution_params }
      end

      context 'with missing attributes' do
        it 'should be invalid request and return error validation messages' do
          json = JSON.parse(response.body).deep_symbolize_keys
          expect(response.code).to eq("400")

          expect(json[:value]).to eq(["can't be blank", "is not a number"])
        end
      end

      context 'with valid attributes' do
        let(:contribution_params) { contribution.attributes }
        it 'should create a new contribution' do
          json = JSON.parse(response.body)
          expect(response.code).to eq("200")
          expect(CommonModels::Contribution.find(json['contribution_id']).present?).to eq(true)
        end
      end
    end
  end

  describe 'PUT #update' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:contribution) { create(:contribution, project: project, user: user) }
    let(:contribution_params) { { value: 20, delivery_status: 'delivered' } }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        put :update, params: { project_id: contribution.project_id, id: contribution.id, contribution: contribution_params }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'

      it do
        expect {
          put :update, params: { project_id: contribution.project_id, id: contribution.id, contribution: contribution_params }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'

      before do
        put :update, params: { project_id: contribution.project_id, id: contribution.id, contribution: contribution_params }
      end

      it { is_expected.to have_http_status('200') }

      it 'should updated contribution' do
        json = JSON.parse(response.body)
        changed = CommonModels::Contribution.find(json['contribution_id'])
        expect(changed.value).to eq(20)
        expect(changed.delivery_status).to eq('delivered')
      end
    end

    context 'with scoped_user not owner of project' do

      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }
      let(:contribution_params) { contribution.attributes }

      it 'should be allowed' do
        expect {
          put :update, params: { project_id: contribution.project_id, id: contribution.id, contribution: contribution_params }
        }.to_not raise_error
      end
    end

    context 'with scoped_user owner of project' do
      before do
        put :update, params: { project_id: contribution.project_id, id: contribution.id, contribution: contribution_params }
      end

      context 'with missing attributes' do
        let(:contribution_params) { { value: nil } }
        it 'should be invalid request and return error validation messages' do
          json = JSON.parse(response.body).deep_symbolize_keys
          expect(response.code).to eq("400")

          expect(json[:value]).to eq(["can't be blank", "is not a number"])
        end
      end

      context 'with valid attributes' do
        it 'should create a new contribution' do
          json = JSON.parse(response.body)
          changed = CommonModels::Contribution.find(json['contribution_id'])
          expect(changed.value).to eq(20)
          expect(changed.delivery_status).to eq('delivered')
        end
      end
    end
  end
end
