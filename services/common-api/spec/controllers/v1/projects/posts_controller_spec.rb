# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::Projects::PostsController, type: :controller do
  let!(:platform) { create(:platform) }
  let!(:another_platform) { create(:platform) }

  let(:user) { create(:user, platform: platform) }
  let(:another_platform_user) { create(:user, platform: another_platform) }

  let(:current_user) { user }
  let(:token_role) { 'scoped_user' }
  let(:platform_token) { platform.token }
  let(:user_id) { current_user.id }
  let(:policy_model_class) { CommonModels::Post }
  let(:policy_scope_class) { PostPolicy::Scope }

  before do
    allow(controller).to receive(:decoded_api) do
      { user_id: user_id,
        role: token_role,
        platform_token: platform_token }.stringify_keys
    end
  end

  describe 'POST #create' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:post_instance) { build(:post, project: project) }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        post :create, params: { project_id: post_instance.project_id, post: post_instance.attributes }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'

      it do
        expect {
          post :create, params: { project_id: post_instance.project_id, post: post_instance.attributes }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'
      include_examples 'ensure policy scope usage'
      let(:post_params) { post_instance.attributes }

      before do
        post :create, params: { project_id: post_instance.project_id, post: post_params }
      end

      it { is_expected.to have_http_status('200') }
      it 'should create a new post' do
        json = JSON.parse(response.body)
        expect(CommonModels::Post.find(json['post_id']).present?).to eq(true)
      end
    end

    context 'with scoped_user not owner of project' do
      include_examples 'ensure policy scope usage'
      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }
      let(:post_params) { post_instance.attributes }

      it 'should not allowed' do
        expect {
          post :create, params: { project_id: post_instance.project_id, post: post_params }
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'with scoped_user owner of project' do
      include_examples 'ensure policy scope usage'
      let(:post_params) { { title: 'foo' } }

      before do
        post :create, params: { project_id: post_instance.project_id, post: post_params }
      end

      context 'with missing attributes' do
        it 'should be invalid request and return error validation messages' do
          json = JSON.parse(response.body).deep_symbolize_keys
          expect(response.code).to eq("400")

          expect(json[:comment_html]).to eq(["can't be blank"])
        end
      end

      context 'with valid attributes' do
        let(:post_params) { post_instance.attributes }
        it 'should create a new post' do
          json = JSON.parse(response.body)
          expect(response.code).to eq("200")
          expect(CommonModels::Post.find(json['post_id']).present?).to eq(true)
        end
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:project) { create(:project, user_id: current_user.id, platform: platform) }
    let(:post_instance) { create(:post, project: project) }

    subject { response }

    context 'with anonymous' do
      include_examples 'with anonymous'
      before do
        delete :destroy, params: { project_id: post_instance.project_id, id: post_instance.id }
      end

      it { is_expected.to have_http_status('403') }
    end

    context 'with platform_user from another platform' do
      include_examples 'with platform user from another platform'

      it do
        expect {
          delete :destroy, params: { project_id: post_instance.project_id, id: post_instance.id }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with platform_user from current_platform' do
      include_examples 'with platform user from current platform'
      include_examples 'ensure policy scope usage'

      before do
        delete :destroy, params: { project_id: post_instance.project_id, id: post_instance.id }
      end

      it { is_expected.to have_http_status('200') }

      it 'should delete post' do
        json = JSON.parse(response.body)
        expect {
          CommonModels::Post.find(json['post_id'])
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with scoped_user not owner of project' do
      include_examples 'ensure policy scope usage'
      let(:not_owner) { create(:user, platform: platform) }
      let(:token_role) { 'scoped_user' }
      let(:user_id) { not_owner.id }
      let(:post_params) { post_instance.attributes }

      it 'should not allowed' do
        expect {
          delete :destroy, params: { project_id: post_instance.project_id, id: post_instance.id }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with scoped_user owner of project' do
      include_examples 'ensure policy scope usage'
      before do
        delete :destroy, params: { project_id: post_instance.project_id, id: post_instance.id }
      end

      it 'should delete post' do
        json = JSON.parse(response.body)
        expect {
          CommonModels::Post.find(json['post_id'])
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

end
