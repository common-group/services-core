# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FlexProjectMachine, type: :model do
  let(:project_state) { 'draft' }
  let(:flexible_project) { create(:flexible_project, state: project_state) }

  subject { flexible_project.state_machine }

  before do
    allow(flexible_project).to receive(:paid_pledged).and_return(10)
    allow(flexible_project).to receive(:notify_observers).and_call_original
  end

  it 'should starts in draft' do
    expect(subject.current_state).to eq('draft')
  end

  def should_be_valid_transition(transition_to)
    expect(flexible_project).to receive(:notify_observers)
      .with(:"from_#{project_state}_to_#{transition_to.to_s}")
      .and_call_original

    subject.transition_to(transition_to, { to_state: transition_to })
    expect(subject.current_state).to eq(transition_to.to_s)
    expect(flexible_project.state).to eq(transition_to.to_s)
    expect(flexible_project.project_transitions
      .where(to_state: transition_to.to_s).count).to eq(1)
  end

  def should_not_be_valid_transition(transition_to)
    subject.transition_to transition_to, { to_state: transition_to }
    expect(subject.current_state).not_to eq(transition_to.to_s)
    expect(flexible_project.reload.state).not_to eq(transition_to.to_s)
    expect(flexible_project.project_transitions.where(to_state: transition_to.to_s).count).to eq(0)
  end

  context 'rejected -> draft/deleted' do
    let(:project_state) { 'rejected' }
    it { should_be_valid_transition 'draft' }
    it { should_be_valid_transition 'deleted' }
  end

  context 'rejected -> other states' do
    let(:project_state) { 'rejected' }
    %i[online successful waiting_funds].each do |state|
      it "can't transition from rejected to #{state}" do
        expect(subject.transition_to(state)).to eq(false)
      end
    end
  end

  context 'draft -> online' do
    %i[draft successful waiting_funds].each do |state|
      it "can't transition from draft to #{state}" do
        expect(subject.transition_to(state)).to eq(false)
      end
    end

    context 'when is valid project' do
      it { should_be_valid_transition 'online' }
    end

    context 'when is invalid project' do
      before do
        flexible_project.name = nil
        flexible_project.about_html = nil
      end

      it 'should save errors do db' do
        should_not_be_valid_transition 'online'
        expect(flexible_project.project_errors.count).to eq(2)
      end
    end
  end

  context 'online -> waiting_funds' do
    let(:project_state) { 'online' }

    context 'project expired and have waiting payments' do
      before do
        allow(flexible_project).to receive(:expired?).and_return(true)
        allow(flexible_project).to receive(:in_time_to_wait?).and_return(true)
      end

      it { should_be_valid_transition 'waiting_funds' }
    end

    context 'project expired but not have pending payments' do
      before do
        allow(flexible_project).to receive(:expired?).and_return(true)
        allow(flexible_project).to receive(:in_time_to_wait?).and_return(false)
      end

      it { should_not_be_valid_transition 'waiting_funds' }
    end

    context 'project not expired' do
      before do
        allow(flexible_project).to receive(:expired?).and_return(false)
      end

      it { should_not_be_valid_transition 'waiting_funds' }
    end
  end

  context 'online -> successful' do
    let(:project_state) { 'online' }

    context 'project expired and not have waiting payments' do
      before do
        allow(flexible_project).to receive(:expired?).and_return(true)
        allow(flexible_project).to receive(:in_time_to_wait?).and_return(false)
      end

      it { should_be_valid_transition 'successful' }
    end

    context "when can't go to successful" do
      it 'should not transition when project has pending payments' do
        allow(flexible_project).to receive(:expired?).and_return(true)
        allow(flexible_project).to receive(:in_time_to_wait?).and_return(true)
        should_not_be_valid_transition 'successful'
      end

      it 'should not transition when project is not expired' do
        allow(flexible_project).to receive(:expired?).and_return(false)
        should_not_be_valid_transition 'successful'
      end
    end
  end

  context 'waiting_funds -> successful' do
    let(:project_state) { 'waiting_funds' }

    before do
      allow(flexible_project).to receive(:expired?).and_return(true)
    end

    context 'project not have waiting payments' do
      before do
        allow(flexible_project).to receive(:in_time_to_wait?)
          .and_return(false)
      end

      it { should_be_valid_transition 'successful' }
    end

    context 'project have pending payments' do
      before do
        allow(flexible_project).to receive(:in_time_to_wait?)
          .and_return(true)
      end

      it { should_not_be_valid_transition 'successful' }
    end
  end

  context '#push_to_draft' do
    before do
      expect(subject).to receive(:transition_to)
        .with(:draft, { to_state: 'draft' }).and_call_original
    end

    it { subject.push_to_draft }
  end

  context '#push_to_trash' do
    before do
      expect(subject).to receive(:transition_to).with(:deleted, { to_state: 'deleted' }).and_call_original
      expect(flexible_project).to receive(:index_on_common).at_least(:once).and_call_original
    end

    it { subject.push_to_trash }
  end

  context '#reject' do
    before do
      expect(subject).to receive(:transition_to)
        .with(:rejected, { to_state: 'rejected' }).and_call_original
    end

    it { subject.reject }
  end

  context '#push_to_online' do
    before do
      expect(subject).to receive(:transition_to)
        .with(:online, { to_state: 'online' }).and_call_original
    end

    it { subject.push_to_online }
  end

  context '#finish' do
    let(:project_state) { 'online' }

    before do
      allow(flexible_project).to receive(:expired?)
        .and_return(true)
    end

    context 'when have a cancelation request' do
      before do
        create(:project_cancelation, project: flexible_project)

        expect(subject).to receive(:transition_to)
          .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)
        expect(subject).to receive(:transition_to)
          .with(:successful, { to_state: 'successful' }).and_return(false)
        expect(subject).to receive(:transition_to)
          .with(:failed, { to_state: 'failed' }).and_return(false)
      end

      it { subject.finish }
    end

    context "when can't go to successful" do
      before do
        allow(flexible_project).to receive(:in_time_to_wait?)
          .and_return(true)

        expect(subject).to receive(:transition_to)
          .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(true)

        expect(subject).not_to receive(:transition_to)
          .with(:successful, { to_state: 'successful' })
      end

      it { subject.finish }
    end

    context 'when can go to successful' do
      before do
        allow(flexible_project).to receive(:in_time_to_wait?)
          .and_return(false)

        expect(subject).to receive(:transition_to)
          .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

        expect(subject).to receive(:transition_to)
          .with(:failed, { to_state: 'failed' }).and_return(false)

        expect(subject).to receive(:transition_to)
          .with(:successful, { to_state: 'successful' }).and_return(true)
      end
      it { subject.finish }
    end

    context 'when can go to failed' do
      before do
        expect(subject).to receive(:transition_to)
          .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

        expect(subject).to receive(:transition_to)
          .with(:failed, { to_state: 'failed' }).and_return(true)
      end
      it { subject.finish }
    end
  end

  context '#after_transaction' do
    before do
      flexible_project.state_machine.transition_to!(:online)
      contribution = create(:confirmed_contribution, value: 10, project: flexible_project)
      contribution.payments.last.update(created_at: Time.zone.now - 1.month)
      contribution.user.update(account_type: 'pf')
      create(:antifraud_analysis, payment: contribution.payments.last, created_at: Time.zone.now - 1.month)

      allow(flexible_project).to receive(:expired?).and_return(true)
      allow(flexible_project).to receive(:in_time_to_wait?).and_return(false)
      flexible_project.state_machine.transition_to!(:successful)
    end

    it 'create project fiscal' do
      expect(ProjectFiscal.last.attributes['project_id']).to eq(flexible_project.id)
    end
  end
end
