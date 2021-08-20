# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AonProjectMachine, type: :model do
  let(:project_state) { 'draft' }
  let(:project) { create(:project, state: project_state) }

  describe 'state_machine' do
    subject { project.state_machine }

    before do
      allow(project).to receive(:notify_observers).and_call_original
    end

    context 'should starts in draft' do
      it do
        expect(subject.current_state).to eq('draft')
      end
    end

    context 'transitions' do
      shared_examples 'valid project transaction flow' do |transition_to|
        before do
          expect(project).to receive(:notify_observers)
            .with(:"from_#{project_state}_to_#{transition_to.to_s}")
            .and_call_original

          subject.transition_to(transition_to, { to_state: transition_to })
        end

        it "should turn current_state to #{transition_to}" do
          expect(subject.current_state).to eq(transition_to.to_s)
        end

        it 'should persist the current_status into project.state' do
          expect(project.state).to eq(transition_to.to_s)
        end

        it 'should create an most recent transition to_locale' do
          expect(project.project_transitions.where(to_state: transition_to.to_s).count).to eq(1)
        end
      end

      AonProjectMachine.states.each do |state|
        shared_examples "valid #{state} project transaction" do
          it_should_behave_like 'valid project transaction flow', state.to_sym
        end

        shared_examples "invalid #{state} project transaction" do
          it_should_behave_like 'invalid project transaction flow', state.to_sym
        end
      end

      shared_examples 'invalid project transaction flow' do |transition_to|
        before do
          subject.transition_to(transition_to, { to_state: transition_to })
        end

        it "should not turn current_state to #{transition_to}" do
          expect(subject.current_state).not_to eq(transition_to.to_s)
        end

        it "should not turn project.state to #{transition_to}" do
          expect(project.reload.state).not_to eq(transition_to.to_s)
        end

        it 'should not create an most recent transition to_locale' do
          expect(project.project_transitions.where(to_state: transition_to.to_s).count).to eq(0)
        end
      end

      context 'rejected can go to draft, deleted only' do
        let(:project_state) { 'rejected' }

        context 'valid transitions' do
          it_should_behave_like 'valid draft project transaction'
          it_should_behave_like 'valid deleted project transaction'
        end

        %i[online successful waiting_funds].each do |state|
          it "can't transition from draft to #{state}" do
            expect(subject.transition_to(state, { to_state: state })).to eq(false)
          end
        end
      end

      context 'online project can go to waiting_funds, successful or failed' do
        let(:project_state) { 'online' }

        context 'waiting_funds transition' do
          context 'when can go to waiting_funds' do
            context 'project expired and have waiting payments' do
              before do
                allow(project).to receive(:expired?).and_return(true)
                allow(project).to receive(:in_time_to_wait?).and_return(true)
              end

              it_should_behave_like 'valid waiting_funds project transaction'
            end
          end

          context "when can't go to waiting_funds" do
            context 'project expired but not have pending payments' do
              before do
                allow(project).to receive(:expired?).and_return(true)
                allow(project).to receive(:in_time_to_wait?).and_return(false)
              end

              it_should_behave_like 'invalid waiting_funds project transaction'
            end

            context 'project not expired' do
              before do
                allow(project).to receive(:expired?).and_return(false)
              end

              it_should_behave_like 'invalid waiting_funds project transaction'
            end
          end
        end

        context 'failed transition' do
          context 'when can go to failed' do
            context 'when project expired, not have waiting paymnts and not reached the goal' do
              before do
                allow(project).to receive(:expired?)
                  .and_return(true)

                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)

                allow(project).to receive(:reached_goal?)
                  .and_return(false)
              end

              it_should_behave_like 'valid failed project transaction'
            end
          end

          context "when can't go to failed" do
            context 'when project expired, have waiting payments and not reached the goal' do
              before do
                allow(project).to receive(:expired?)
                  .and_return(true)

                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                allow(project).to receive(:reached_goal?)
                  .and_return(false)
              end

              it_should_behave_like 'invalid failed project transaction'
            end
          end

          context 'when project expired, not have waiting payments and reached the goal' do
            before do
              allow(project).to receive(:expired?)
                .and_return(true)

              allow(project).to receive(:in_time_to_wait?)
                .and_return(true)

              allow(project).to receive(:reached_goal?)
                .and_return(false)
            end

            it_should_behave_like 'invalid failed project transaction'
          end
        end

        context 'successful transition' do
          context 'when can go to successful' do
            context 'project expired, not have waiting payments and reached the goal' do
              before do
                allow(project).to receive(:expired?)
                  .and_return(true)

                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)

                allow(project).to receive(:reached_goal?)
                  .and_return(true)
              end

              it_should_behave_like 'valid successful project transaction'
            end
          end

          context "when can't go to successful" do
            context 'project expired, have pending payments and reached the goal' do
              before do
                allow(project).to receive(:expired?).and_return(true)
                allow(project).to receive(:in_time_to_wait?).and_return(true)
                allow(project).to receive(:reached_goal?).and_return(true)
              end

              it_should_behave_like 'invalid successful project transaction'
            end

            context 'project does not reached the goal and not have pending_paymnts' do
              before do
                allow(project).to receive(:expired?).and_return(true)
                allow(project).to receive(:in_time_to_wait?).and_return(false)
                allow(project).to receive(:reached_goal?).and_return(false)
              end

              it_should_behave_like 'invalid successful project transaction'
            end

            context 'project not expired' do
              before do
                allow(project).to receive(:expired?).and_return(false)
              end

              it_should_behave_like 'invalid successful project transaction'
            end
          end
        end
      end

      context 'waiting_funds project can go to successful or failed' do
        let(:project_state) { 'waiting_funds' }

        before do
          allow(project).to receive(:expired?).and_return(true)
        end

        context 'failed transition' do
          context 'when can go to failed' do
            context 'project not have waiting payments and not reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(false)
                allow(project).to receive(:reached_goal?).and_return(false)
              end

              it_should_behave_like 'valid failed project transaction'
            end
          end

          context "when can't go to failed" do
            context 'project have pending payments and already reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(true)
                allow(project).to receive(:reached_goal?).and_return(true)
              end

              it_should_behave_like 'invalid failed project transaction'
            end

            context 'project not have pending payments and reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(false)
                allow(project).to receive(:reached_goal?).and_return(true)
              end

              it_should_behave_like 'invalid failed project transaction'
            end

            context 'project does not expired' do
              before { allow(project).to receive(:expired?).and_return(false) }

              it_should_behave_like 'invalid failed project transaction'
            end
          end
        end

        context 'successful transition' do
          context 'when can go to successful' do
            context 'project not have waiting payments and reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(false)
                allow(project).to receive(:reached_goal?).and_return(true)
              end

              it_should_behave_like 'valid successful project transaction'
            end
          end

          context "when can't go to successful" do
            context 'project have pending payments and reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(true)
                allow(project).to receive(:reached_goal?).and_return(true)
              end

              it_should_behave_like 'invalid successful project transaction'
            end

            context 'project have pending payments and not reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(true)
                allow(project).to receive(:reached_goal?).and_return(false)
              end

              it_should_behave_like 'invalid successful project transaction'
            end

            context 'project not have pending payments and not reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?).and_return(false)
                allow(project).to receive(:reached_goal?).and_return(false)
              end

              it_should_behave_like 'invalid successful project transaction'
            end

            context 'project does not expired' do
              before { allow(project).to receive(:expired?).and_return(false) }

              it_should_behave_like 'invalid successful project transaction'
            end
          end
        end
      end
    end

    context 'instance methods' do
      before do
        allow(subject).to receive(:push_to_draft).and_call_original
      end

      context '#can_reject?' do
        before do
          expect(subject).to receive(:can_transition_to?)
            .with(:rejected)
        end

        it { subject.can_reject? }
      end

      context '#can_push_to_online?' do
        before do
          expect(subject).to receive(:can_transition_to?)
            .with(:online)
        end

        it { subject.can_push_to_online? }
      end

      context '#can_push_to_trash?' do
        before do
          expect(subject).to receive(:can_transition_to?)
            .with(:deleted)
        end

        it { subject.can_push_to_trash? }
      end

      context '#can_push_to_draft?' do
        before do
          expect(subject).to receive(:can_transition_to?)
            .with(:draft)
        end

        it { subject.can_push_to_draft? }
      end

      context '#finish' do
        before do
          allow(project).to receive(:expired?).and_return(true)
        end

        context 'when project_state is waiting_funds' do
          let(:project_state) { 'waiting_funds' }

          context "can't go to failed" do
            context 'when project have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it { subject.finish }
            end

            context 'when project not have pending contributions but reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(true)
              end

              it { subject.finish }
            end

            context 'when project is not expired' do
              before do
                allow(project).to receive(:expired?)
                  .and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it { subject.finish }
            end
          end

          context 'can go to failed' do
            context 'when project not reached the goal and not have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(true)
              end

              it { subject.finish }
            end
          end

          context "can't go to waiting_funds" do
            context 'when project not have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)

                allow(project).to receive(:reached_goal?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(true)
              end

              it { subject.finish }
            end

            context 'when project have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it 'should be false but remains on waiting_funds' do
                expect(subject.finish).to eq(false)
                expect(subject.current_state).to eq('waiting_funds')
              end
            end
          end

          context 'can go to successful' do
            context 'when project reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(true)
              end

              it { subject.finish }
            end
          end

          context "can't go to successful" do
            context 'when project have cancelation request' do
              before do
                create(:project_cancelation, project: project)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it { subject.finish }
            end

            context 'when project still have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it { subject.finish }
            end

            context 'when project not have reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(true)

                expect(subject).not_to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' })
              end

              it { subject.finish }
            end
          end
        end

        context 'when project_state is online' do
          let(:project_state) { 'online' }

          context 'can go to failed' do
            context 'when project not reached the goal and not have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(true)

                expect(subject).not_to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' })
              end

              it { subject.finish }
            end
          end

          context "can't go to failed" do
            context 'when project have cancelation request' do
              before do
                create(:project_cancelation, project: project)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)
              end

              it { subject.finish }
            end

            context 'when project have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(true)
                expect(subject).not_to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' })
              end

              it { subject.finish }
            end

            context 'when project not have pending contributions but reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)

                allow(project).to receive(:reached_goal?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(true)
              end

              it { subject.finish }
            end

            context 'when project is not expired' do
              before do
                allow(project).to receive(:expired?)
                  .and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it { subject.finish }
            end
          end

          context "can't go to waiting_funds" do

            context 'when project have cancelation request' do
              before do
                create(:project_cancelation, project: project)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)

              end

              it { subject.finish }
            end

            context 'when project not have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)

                allow(project).to receive(:reached_goal?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(true)
              end

              it { subject.finish }
            end
          end

          context 'can go to waiting_funds' do
            context 'when project have pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(true)
                expect(subject).not_to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' })
                expect(subject).not_to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' })
              end

              it { subject.finish }
            end
          end

          context "can't go to successful" do

            context 'when project have cancelation request' do
              before do
                create(:project_cancelation, project: project)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(false)
              end

              it { subject.finish }
            end

            context 'when project has pending contributions' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(true)
                expect(subject).not_to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' })
                expect(subject).not_to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' })
              end

              it { subject.finish }
            end

            context 'when project not reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)
                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(true)
                expect(subject).not_to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' })
              end

              it { subject.finish }
            end
          end

          context 'can go to successful' do
            context 'when project dont have pending contributions and reached the goal' do
              before do
                allow(project).to receive(:in_time_to_wait?)
                  .and_return(false)
                allow(project).to receive(:reached_goal?)
                  .and_return(true)

                expect(subject).to receive(:transition_to)
                  .with(:waiting_funds, { to_state: 'waiting_funds' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:failed, { to_state: 'failed' }).and_return(false)

                expect(subject).to receive(:transition_to)
                  .with(:successful, { to_state: 'successful' }).and_return(true)
              end

              it { subject.finish }
            end
          end
        end
      end
    end

    context '#after_transaction' do
      before do
        project.state_machine.transition_to!(:online)
        contribution = create(:confirmed_contribution, value: 10, project: project)
        contribution.payments.last.update(created_at: Time.zone.now - 1.month)
        create(:antifraud_analysis, payment: contribution.payments.last, created_at: Time.zone.now - 1.month)

        allow(project).to receive(:expired?).and_return(true)
        allow(project).to receive(:in_time_to_wait?).and_return(false)
        allow(project).to receive(:reached_goal?).and_return(true)
        project.state_machine.transition_to!(:successful)
      end

      it 'create project fiscal' do
        expect(ProjectFiscal.last.attributes['project_id']).to eq(project.id)
      end
    end
  end
end
