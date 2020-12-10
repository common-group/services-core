# encoding:utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.shared_examples 'redirect to edit_user_path' do
  let(:action) { nil }
  let(:anchor) { nil }

  context 'when user is logged' do
    let(:current_user) { create(:user) }

    before do
      allow(controller).to receive(:current_user).and_return(current_user)
      get action, params: { id: current_user.id, locale: :pt }
    end

    it { is_expected.to redirect_to edit_user_path(current_user, anchor: (anchor || action.to_s)) }
  end

  context 'when user is not logged' do
    let(:current_user) { create(:user) }

    before do
      allow(controller).to receive(:current_user).and_return(nil)
      get :settings, params: { id: current_user.id, locale: :pt }
    end

    it { is_expected.to redirect_to sign_up_path }
  end
end

RSpec.describe UsersController, type: :controller do
  render_views
  subject { response }
  before do
    allow(controller).to receive(:current_user).and_return(current_user)
    allow_any_instance_of(User).to receive(:cancel_all_subscriptions).and_return(true)
  end

  let(:successful_project) { create(:project, state: 'successful') }
  let(:failed_project) { create(:project, state: 'failed') }
  let(:user) { create(:user, password: 'current_password', password_confirmation: 'current_password', authorizations: [create(:authorization, uid: 666, oauth_provider: create(:oauth_provider, name: 'facebook'))]) }
  let(:current_user) { user }

  describe 'GET settings' do
    it_should_behave_like 'redirect to edit_user_path' do
      let(:action) { :settings }
    end
  end

  describe 'GET billing' do
    it_should_behave_like 'redirect to edit_user_path' do
      let(:action) { :settings }
    end
  end

  describe 'GET reactivate' do
    let(:current_user) { nil }

    before do
      user.deactivate
    end

    context 'when token is nil' do
      let(:token) { 'nil' }

      before do
        expect(controller).to_not receive(:sign_in)
        get :reactivate, params: { id: user.id, token: token, locale: :pt }
      end

      it 'should not set deactivated_at to nil' do
        expect(user.reload.deactivated_at).to_not be_nil
      end

      it { is_expected.to redirect_to root_path }
    end

    context 'when token is NOT valid' do
      let(:token) { 'invalid token' }

      before do
        expect(controller).to_not receive(:sign_in)
        get :reactivate, params: { id: user.id, token: token, locale: :pt }
      end

      it 'should not set deactivated_at to nil' do
        expect(user.reload.deactivated_at).to_not be_nil
      end

      it { is_expected.to redirect_to root_path }
    end

    context 'when token is valid' do
      let(:token) { user.reactivate_token }

      before do
        expect(controller).to receive(:sign_in).with(user)
        get :reactivate, params: { id: user.id, token: token, locale: :pt }
      end

      it 'should set deactivated_at to nil' do
        expect(user.reload.deactivated_at).to be_nil
      end

      it { is_expected.to redirect_to root_path }
    end
  end

  describe 'DELETE destroy' do
    context 'when user has published_projects' do
      let(:project) { create(:project, state: 'online', user: user) }
      before do
        allow(controller).to receive(:current_user).and_call_original
        delete :destroy, params: { id: user.id, locale: :pt }
      end

      it 'should not set deactivated_at' do
        expect(user.reload.deactivated_at).to be_nil
      end

      it { is_expected.not_to redirect_to user_path(user, anchor: 'settings') }
    end
    context 'when user is beign deactivated by admin' do
      before do
        allow(controller).to receive(:current_user).and_call_original
        sign_in(create(:user, admin: true))
        delete :destroy, params: { id: user.id, locale: :pt }
      end

      it 'should set deactivated_at' do
        expect(user.reload.deactivated_at).to_not be_nil
      end

      it 'should not sign user out' do
        expect(controller.current_user).to_not be_nil
      end

      it { is_expected.to redirect_to root_path }
    end

    context 'when user is loged' do
      before do
        allow(controller).to receive(:current_user).and_call_original
        sign_in(current_user)
        delete :destroy, params: { id: user.id, locale: :pt }
      end

      it 'should set deactivated_at' do
        expect(user.reload.deactivated_at).to_not be_nil
      end

      it 'should sign user out' do
        expect(controller.current_user).to be_nil
      end

      it { is_expected.to redirect_to root_path }
    end

    context 'when user is not loged' do
      let(:current_user) { nil }
      before do
        delete :destroy, params: { id: user.id, locale: :pt }
      end

      it 'should not set deactivated_at' do
        expect(user.reload.deactivated_at).to be_nil
      end

      it { is_expected.not_to redirect_to user_path(user, anchor: 'settings') }
    end
  end

  describe 'GET unsubscribe_notifications' do
    context 'when user is loged' do
      before do
        get :unsubscribe_notifications, params: { id: user.id, locale: 'pt' }
      end

      it { is_expected.to redirect_to edit_user_path(user, anchor: 'notifications') }
    end

    context 'when user is not loged' do
      let(:current_user) { nil }
      before do
        get :unsubscribe_notifications, params: { id: user.id, locale: 'pt' }
      end

      it { is_expected.to redirect_to new_user_registration_path }
    end
  end

  describe 'POST new_password' do
    context 'without password parameter' do
      before do
        post :new_password, params: { id: user.id, locale: 'pt' }
      end

      it { expect(response.status).to eq 400 }
      it { expect(response.content_type).to include 'application/json' }
      it { expect(JSON.parse(response.body)).to eq JSON.parse('{"errors": ["Missing parameter password"]}') }
    end

    context 'with an invalid password parameter' do
      before do
        post :new_password, params: { id: user.id, locale: 'pt', password: '12' }
      end

      it { expect(response.status).to eq 400 }
      it { expect(response.content_type).to include 'application/json' }
      it { expect(JSON.parse(response.body)).to eq JSON.parse('{"errors":["Senha A senha é muito curta. Mínimo 6 caracteres."]}') }
    end

    context 'with a valid password parameter' do
      before do
        post :new_password, params: { id: user.id, locale: 'pt', password: 'newpassword123' }
      end

      it { expect(response.status).to eq 200 }
      it { expect(response.content_type).to include 'application/json' }
      it { expect(JSON.parse(response.body)).to eq JSON.parse('{"success": "OK"}') }
    end
  end

  describe 'PUT update' do
    context 'with password parameters' do
      let(:current_password) { 'current_password' }
      let(:password) { 'newpassword123' }
      let(:password_confirmation) { 'newpassword123' }

      before do
        put :update, params: {
          id: user.id,
          locale: 'pt',
          user: {
            current_password: current_password,
            password: password,
            password_confirmation: password_confirmation
          }
        }
      end

      context 'with wrong current password' do
        let(:current_password) { 'wrong_password' }
        it { expect(user.errors).not_to be_nil }
      end

      context 'with right current password and right confirmation' do
        it { is_expected.to redirect_to edit_user_path(user) }
      end
    end

    context 'with out password parameters' do
      let(:project) { create(:project, state: 'successful') }
      let(:category) { create(:category) }
      before do
        create(:category_follower, user: user)
        put :update, params: {
          id: user.id,
          locale: 'pt',
          user: {
            twitter: 'test',
            unsubscribes: { project.id.to_s => '1' }
          }
        }
      end
      it('should update the user and nested models') do
        user.reload
        expect(user.twitter).to eq('test')
        expect(user.category_followers.size).to eq(1)
      end
      it { is_expected.to redirect_to edit_user_path(user) }
    end

    context 'with mail marteking attributes' do
      let!(:marketing_list) { create(:mail_marketing_list) }
      let!(:marketing_list_current) { create(:mail_marketing_list) }
      let!(:marketing_user) { create(:mail_marketing_user, mail_marketing_list: marketing_list_current, user: user) }

      before do
        put :update, params: {
          id: user.id,
          locale: 'pt',
          user: {
            mail_marketing_users_attributes: {
              '0' => { mail_marketing_list_id: marketing_list.id },
              '1' => { id: marketing_user.id, "_destroy": '1'}
            }
          }
        }
      end

      it "should in new list" do
        expect(
          user.mail_marketing_users
          .where(mail_marketing_list_id: marketing_list.id)
          .exists?
        ).to eq(true)
      end

      it "should be removed from list check for destroy" do
        expect(
          user.mail_marketing_users
          .where(mail_marketing_list_id: marketing_list_current.id)
          .exists?
        ).to eq(false)
      end
    end

    context 'removing category followers' do
      let(:project) { create(:project, state: 'successful') }
      before do
        create(:category_follower, user: user)
        put :update, params: {
          id: user.id,
          category_followers_form: true,
          locale: 'pt',
          user: {
            twitter: 'test',
            unsubscribes: { project.id.to_s => '1' },
            category_followers_attributes: []
          }
        }
      end
      it('should clear category followers') do
        user.reload
        expect(user.category_followers.size).to eq(0)
      end
      it { is_expected.to redirect_to edit_user_path(user) }
    end
  end

  describe 'GET show' do
    before do
      get :show, params: { id: user.id, locale: 'pt', ref: 'test' }
    end

    context 'when user is no longer active' do
      let(:user) { create(:user, deactivated_at: Time.now) }
      it { is_expected.to have_http_status(404) }
    end

    context 'when user is active' do
      it { is_expected.to be_successful }
    end

    #it 'should set referral session' do
    #  expect(cookies[:referral_link]).to eq 'test'
    #end
  end

  describe 'POST ban' do
    context 'without admin permissions' do
      before do
        post :ban, params: { id: user.id, locale: 'pt', format: :json }
      end

      it { expect(response.status).to eq 302 }
    end

    context 'with admin permissions' do
      before do
        user.update_column(:admin, true)
        post :ban, params: { id: user.id, locale: 'pt', format: :json }
        user.reload
      end

      it { expect(response.status).to eq 200 }
      it { expect(user.banned_at.present?).to eq(true) }
    end
  end
end
