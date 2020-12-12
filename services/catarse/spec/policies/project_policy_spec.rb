# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectPolicy do
  subject { ProjectPolicy }

  shared_examples_for 'create permissions' do
    it 'should deny access if user is nil' do
      is_expected.not_to permit(nil, Project.new)
    end

    it 'should deny access if user is not project owner' do
      is_expected.not_to permit(User.new, Project.new(user: User.new))
    end

    it 'should permit access if user is project owner' do
      new_user = User.new
      is_expected.to permit(new_user, Project.new(user: new_user))
    end

    it 'should permit access if user is admin' do
      admin = User.new
      admin.admin = true
      is_expected.to permit(admin, Project.new(user: User.new))
    end
  end

  describe 'UserScope' do
    describe '.resolve' do
      let(:current_user) { create(:user, admin: false) }
      let(:user) { create(:user) }

      before do
        @draft = create(:project, state: 'draft', user: user)
        @online = create(:project, state: 'online', user: user)
      end

      subject { ProjectPolicy::UserScope.new(current_user, user, user.projects).resolve.order('created_at desc') }

      context 'when user is admin' do
        let(:current_user) { create(:user, admin: true) }

        it { expect(subject.count).to eq 2 }
      end

      context 'when user is a project owner' do
        let(:current_user) { user }
        it { is_expected.to eq [@online, @draft] }
      end

      context 'when user is not an admin and project owner' do
        it { is_expected.to eq [@online] }
      end
    end
  end

  permissions :create? do
    it_should_behave_like 'create permissions'
  end

  permissions :update? do
    it_should_behave_like 'create permissions'
  end

  describe '#permitted_for?' do
    context 'when user is nil and I want to update about_html' do
      let(:policy) { ProjectPolicy.new(nil, Project.new) }
      subject { policy.permitted_for?(:about_html, :update) }
      it { is_expected.to eq(false) }
    end

    context 'when user is project owner and I want to update about_html' do
      let(:project) { create(:project) }
      let(:policy) { ProjectPolicy.new(project.user, project) }
      subject { policy.permitted_for?(:about_html, :update) }
      it { is_expected.to eq(true) }
    end
  end

  describe '#reward_attributes' do
    let(:project) { create(:project, state: 'online') }
    let(:policy) { ProjectPolicy.new(project.user, project) }

    subject { policy.reward_attributes }

    context 'when project is open for contributions' do
      it 'should can edit deliver_at' do
        expect(subject[:rewards_attributes]).to include(:deliver_at)
      end
    end

    context 'when project is finished' do
      before do
        allow(project).to receive(:waiting_funds?).and_return(true)
      end
      it "should can't edit deliver_at" do
        expect(subject[:rewards_attributes]).to_not include(:deliver_at)
      end
    end
  end

  describe '#permitted?' do
    context 'when user is nil' do
      let(:policy) { ProjectPolicy.new(nil, Project.new) }
      %i[about_html video_url uploaded_image headline].each do |field|
        context "when field is #{field}" do
          subject { policy.permitted?(field) }
          it { is_expected.to eq(true) }
        end
      end
      context 'when field is title' do
        subject { policy.permitted?(:title) }
        it { is_expected.to eq(false) }
      end
    end

    context 'when user isn`t admin' do
      let(:user) { create(:user) }
      let(:project) { create(:project) }
      let(:policy) { ProjectPolicy.new(user, project) }

      before do
        user.admin = false
        user.save!
      end

      %i[
        audited_user_name audited_user_cpf audited_user_phone_number state origin_id service_fee total_installments
        recommended created_at updated_at expires_at all_tags tracker_snippet_html user_id admin_tags solidarity_covid
      ].each do |attribute|
        context "when field is #{attribute.to_s}" do
          subject { policy.permitted?(attribute) }

          it { is_expected.to be_falsey }
        end
      end
    end

    context 'when user is admin' do
      let(:user) { create(:user) }
      let(:project) { create(:project) }
      let(:policy) { ProjectPolicy.new(user, project) }

      before do
        user.admin = true
        user.save!
      end

      Project.attribute_names.each do |field|
        context "when field is #{field}" do
          subject { policy.permitted?(field.to_sym) }
          it { is_expected.to eq(true) }
        end
      end
    end
  end
end
