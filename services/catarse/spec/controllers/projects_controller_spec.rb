# encoding:utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectsController, type: :controller do
  before do
    allow(controller).to receive(:current_user).and_return(current_user)
    request.env['HTTP_REFERER'] = 'https://catarse.me'
    CatarseSettings[:base_url] = 'http://catarse.me'
    CatarseSettings[:email_projects] = 'foo@bar.com'
  end

  render_views
  subject { response }
  let(:project) { create(:project, state: 'draft') }
  let(:current_user) { nil }

  describe 'POST create' do
    let(:category) { create(:category) }
    let(:project) { build(:project, state: 'draft', category_id: category.id) }
    before do
      post :create, params: { locale: :pt, project: project.attributes }
    end

    context 'when no user is logged in' do
      it { is_expected.to redirect_to new_user_registration_path }
    end

    context 'when user is logged in' do
      let(:current_user) { create(:user, current_sign_in_ip: '127.0.0.1') }
      it { is_expected.to redirect_to insights_project_path(Project.last, locale: nil) }
      it 'should fill with the current_sign_in_ip of user' do
        expect(Project.last.ip_address).to eq(current_user.current_sign_in_ip)
      end
    end
  end

  describe 'GET push_to_online' do
    let(:project) { create(:project, state: 'draft', content_rating: 1) }
    let(:current_user) { project.user }

    before do
      create(:reward, project: project)
      create(:bank_account, user: current_user)
      get :push_to_online, params: { id: project.id, locale: :pt }
      project.reload
    end

    it { expect(project.online?).to eq(true) }
  end

  describe 'GET push_to_online banned document' do
    let(:project) { create(:project, state: 'draft', content_rating: 1) }
    let(:current_user) { project.user }
    let(:banned_cpf) { Faker::IDNumber.brazilian_citizen_number(formatted: true) }

    before do
      current_user.update(cpf: banned_cpf)
      create(:reward, project: project)
      create(:bank_account, user: current_user)
      create(:blacklist_document, number: banned_cpf)
      get :push_to_online, params: { id: project.id, locale: :pt }
      project.reload
    end

    it { expect(project.online?).to eq(false) }
  end

  describe 'GET index' do
    before do
      get :index, params: { locale: :pt }
    end

    it "has response successful" do
      expect(response.code.to_i).to eq(200)
    end

    #context 'with referral link' do
    #  subject { cookies[:referral_link] }

    #  before do
    #    get :index, locale: :pt, ref: 'referral'
    #  end

    #  it { is_expected.to eq('referral') }
    #end
  end

  describe 'GET new' do
    before { get :new, params: { locale: :pt } }

    context 'when user is a guest' do
      it "has response not successful" do
        expect(response.code.to_i).to_not eq(200)
      end
    end

    context 'when user is a registered user' do
      let(:current_user) { create(:user, admin: false) }

      it "has response successful" do
        expect(response.code.to_i).to eq(200)
      end
    end
  end

  describe 'PUT update' do
    shared_examples_for 'updatable project' do
      context 'with tab anchor' do
        before do
          put :update, params: {
            id: project.id,
            locale: :pt,
            anchor: 'basics',
            project: { name: 'My Updated Title', content_rating: 1 }
          }
        end

        it { is_expected.to redirect_to edit_project_path(project, anchor: 'basics') }
      end

      context 'with valid permalink' do
        before do
          put :update, params: { id: project.id, project: { name: 'My Updated Title' }, locale: :pt }
        end

        it {
          project.reload
          expect(project.name).to eq('My Updated Title')
        }

        it { is_expected.to redirect_to edit_project_path(project, anchor: 'home') }
      end

      context 'with content rating equal to 18' do
        before do
          put :update, params: {
            id: project.id,
            project: { name: 'Myege Updated Title', content_rating: 18 },
            locale: :pt
          }
        end

        it {
          project.reload
          expect(project.content_rating).to eq(18)
          expect(project.all_tags).to include(I18n.t('project.adult_content_admin_tag'))
        }

        it { is_expected.to redirect_to edit_project_path(project, anchor: 'home') }
      end

      context 'with content rating less than 18' do
        before do
          put :update, params: {
            id: project.id,
            project: { name: 'My Updated Title', content_rating: 1 },
            locale: :pt
          }
        end

        it {
          project.reload
          expect(project.content_rating).to eq(1)
          expect(project.all_tags).not_to include(I18n.t('project.adult_content_admin_tag'))
        }

        it { is_expected.to redirect_to edit_project_path(project, anchor: 'home') }
      end

      context 'with content rating to a not included number' do
        before do
          put :update, params: {
            id: project.id,
            project: { name: 'My Updated Title', content_rating: 0},
            locale: :pt
          }
        end

        it {
          project.reload
          expect(project.content_rating).to eq(0)
        }
      end
    end

    shared_examples_for 'protected project' do
      before do
        put :update, params: {
          id: project.id,
          locale: :pt,
          project: { name: 'My Updated Title', content_rating: 1 }
        }
      end
      it {
        project.reload
        expect(project.name).to eq('Foo bar')
      }
    end

    context 'when user is a guest' do
      it_should_behave_like 'protected project'
    end

    context 'when user is a project owner' do
      let(:current_user) { project.user }

      context 'when project is offline' do
        it_should_behave_like 'updatable project'
      end

      context 'when project is online' do
        let(:project) { create(:project, state: 'online') }

        before do
          allow(controller).to receive(:current_user).and_return(project.user)
        end

        context 'when I cancel the project' do
          before do
            expect_any_instance_of(Project).to receive(:create_project_cancelation!).and_call_original
            expect_any_instance_of(Project).to receive(:update_columns).with(
            expires_at: DateTime.now).and_call_original

            put :update, params: {
              id: project.id,
              locale: :pt,
              cancel_project: 'true',
              project: {
                content_rating: 1,
                posts_attributes: {
                  "0" => {
                    title: "cancelamento de teste",
                    comment_html: "<p>apenas um teste no cancelamento</p>"
                  }
                }
              }
            }
            project.reload
          end

          it "should generate a project cancelation order" do
            expect(project.project_cancelation.present?).to eq(true)
          end
        end

        context 'with content rating change' do
          before do
            put :update, params: {
              id: project.id,
              locale: :pt,
              project: { name: 'My Updated Title', content_rating: 18 }
            }
          end

          it {
            project.reload
            expect(project.content_rating).to eq(1)
          }

          it { is_expected.to redirect_to edit_project_path(project, anchor: 'home') }
        end

        context 'when I try to update the project name and the about_html field' do
          before do
            put :update, params: {
              id: project.id,
              locale: :pt,
              project: { name: 'new_title', about_html: 'new_description' }
            }
          end

          it 'should not update title' do
            project.reload
            expect(project.name).not_to eq('new_title')
          end
        end

        context 'when I try to update only the about_html field' do
          before do
            put :update, params: {
              id: project.id,
              locale: :pt,
              project: { about_html: 'new_description', content_rating: 1 }
            }
          end

          it 'should update it' do
            project.reload
            expect(project.about_html).to eq('new_description')
          end
        end
      end
    end

    context 'when user is a registered user' do
      let(:current_user) { create(:user, admin: false) }
      it_should_behave_like 'protected project'
    end

    context 'when user is an admin' do
      let(:current_user) { create(:user, admin: true) }
      it_should_behave_like 'updatable project'
    end
  end

  describe 'GET embed' do
    before do
      get :embed, params: { id: project, locale: :pt }
    end
    it { is_expected.to have_http_status(200) }
  end

  describe 'GET show' do
    context 'when we have update_id in the querystring' do
      let(:project) { create(:project) }
      let(:project_post) { create(:project_post, project: project) }
      before { get :show, params: { permalink: project.permalink, project_post_id: project_post.id, locale: :pt } }
      it('should assign update to @update') { expect(assigns(:post)).to eq(project_post) }
    end
  end

  describe 'GET video' do
    context 'url is a valid video' do
      let(:video_url) { 'http://vimeo.com/17298435' }
      before do
        allow(VideoInfo).to receive(:get).and_return({ video_id: 'abcd' })
        get :video, params: { locale: :pt, url: video_url }
      end

      it { expect(response.body).to eq VideoInfo.get(video_url).to_json }
    end

    context 'url is not a valid video' do
      before { get :video, params: { locale: :pt, url: 'http://????' } }

      it { expect(response.body).to eq nil.to_json }
    end
  end

  describe 'Solidarity project' do
    let(:integrations_attributes) { [{ name: 'SOLIDARITY_SERVICE_FEE', data: { name: 'SOLIDARITY FEE NAME' } }] }

    context 'when create solidarity project with service fee 4%' do
      let(:user) { create(:user, admin: false) }
      let(:category) { create(:category) }
      let!(:project) { build(:project, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        post :create, params: {
          locale: :pt,
          project: {
            name: "NEW PROJECT NAME",
            service_fee: 0.04,
            mode: 'flex',
            category_id: category.id,
            integrations_attributes: integrations_attributes
          }
        }

      end

      it 'should set service fee' do
        expect(Project.last.service_fee).to eq 0.04
      end

      it { is_expected.to redirect_to publish_by_steps_project_path(Project.last) }

      it { is_expected.to have_http_status(302) }
    end

    context 'when try to create solidarity project with service fee under 4%' do
      let(:user) { create(:user, admin: false) }
      let(:category) { create(:category) }
      let!(:project) { build(:project, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        post :create, params: {
          locale: :pt,
          project: {
            name: "NEW PROJECT NAME",
            service_fee: 0.03,
            mode: 'flex',
            category_id: category.id,
            integrations_attributes: integrations_attributes
          }
        }

      end

      it 'should set service fee to 13%' do
        expect(Project.last.service_fee).to eq 0.13
      end

      it { is_expected.to redirect_to publish_by_steps_project_path(Project.last) }

      it { is_expected.to have_http_status(302) }
    end

    context 'when try to create solidarity project with service fee over 20%' do
      let(:user) { create(:user, admin: false) }
      let(:category) { create(:category) }
      let!(:project) { build(:project, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        post :create, params: {
          locale: :pt,
          project: {
            name: "NEW PROJECT NAME",
            service_fee: 0.25,
            mode: 'flex',
            category_id: category.id,
            integrations_attributes: integrations_attributes
          }
        }

      end

      it 'should set service fee to 13%' do
        expect(Project.last.service_fee).to eq 0.13
      end

      it { is_expected.to redirect_to publish_by_steps_project_path(Project.last) }

      it { is_expected.to have_http_status(302) }
    end

    context 'when try to create solidarity project with service fee nil' do
      let(:user) { create(:user, admin: false) }
      let(:category) { create(:category) }
      let!(:project) { build(:project, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        post :create, params: {
          locale: :pt,
          project: {
            name: "NEW PROJECT NAME",
            service_fee: nil,
            mode: 'flex',
            category_id: category.id,
            integrations_attributes: integrations_attributes
          }
        }

      end

      it 'should set service fee to 13%' do
        expect(Project.last.service_fee).to eq 0.13
      end

      it { is_expected.to redirect_to publish_by_steps_project_path(Project.last) }

      it { is_expected.to have_http_status(302) }
    end

    context 'when try to update solidarity project with service fee nil' do
      let(:user) { create(:user, admin: false) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: nil,
            name: "NEW PROJECT NAME",
            content_rating:0,
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        expect(project.service_fee).to eq 0.04
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end

    context 'when try to update solidarity project service fee over 4% but under 20%' do
      let(:user) { create(:user, admin: false) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: 0.05,
            name: "NEW PROJECT NAME",
            content_rating:0,
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        project.reload
        expect(project.service_fee).to eq 0.05
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end

    context 'when try to update solidarity project service fee under 4%' do
      let(:user) { create(:user, admin: false) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: 0.03,
            name: "NEW PROJECT NAME",
            content_rating:0,
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        project.reload
        expect(project.service_fee).to eq 0.04
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end


    context 'when try update solidarity project with service fee over 20%' do
      let(:user) { create(:user, admin: false) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: 0.25,
            name: "NEW PROJECT NAME",
            content_rating:0,
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        project.reload
        expect(project.service_fee).to eq 0.04
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end

    context 'when try update solidarity project with service fee nil' do
      let(:user) { create(:user, admin: false) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'draft') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: nil,
            name: "NEW PROJECT NAME",
            content_rating:0,
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        project.reload
        expect(project.service_fee).to eq 0.04
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end

    context 'when solidarity project is online service fee cannot be changed by owner' do
      let(:user) { create(:user, admin: false) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'online') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: 0.05,
            name: "NEW PROJECT NAME",
            content_rating:0,
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        project.reload
        expect(project.service_fee).to eq 0.04
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end

    context 'when solidarity project is online service fee can only be changed by an admin' do
      let(:user) { create(:user, admin: true) }
      let!(:project) { create(:project, user: user, integrations_attributes: integrations_attributes, service_fee: 0.04, state: 'online') }

      before do
        allow(controller).to receive(:current_user).and_return(user)

        put :update, params: {
          id: project.id,
          format: :json,
          project: {
            tracker_snippet_html: "",
            user_id: user.id,
            all_tags: "",
            all_public_tags: "",
            service_fee: 0.05,
            name: "NEW PROJECT NAME",
            permalink: "permalink_url_3128793819732",
          }
        }
      end

      it 'should update project and previously assigned service fee' do
        project.reload
        expect(project.service_fee).to eq 0.05
      end

      it { is_expected.to have_http_status(200) }
      it { expect(response.body).to eq({ success: 'OK' }.to_json) }
    end
  end
end
