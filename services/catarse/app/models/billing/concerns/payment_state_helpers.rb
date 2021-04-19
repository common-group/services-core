module Billing
  module Concerns
    module PaymentStateHelpers
      extend ActiveSupport::Concern

      included do
        include Statesman::Adapters::ActiveRecordQueries[
          transition_class: Billing::PaymentStateTransition,
          initial_state: :created,
          transition_name: :state_transitions
        ]

        has_many :state_transitions, class_name: 'Billing::PaymentStateTransition', dependent: :destroy, autosave: false

        after_create :create_inital_state_transition

        delegate :can_transition_to?, :current_state, :history, :last_transition, :transition_to!, :transition_to,
          :in_state?, to: :state_machine
      end

      def state_machine
        @state_machine ||= Billing::PaymentStateMachine.new(self,
          transition_class: Billing::PaymentStateTransition,
          association_name: :state_transitions
        )
      end

      private

      def create_inital_state_transition
        state_transitions.create(to_state: state, sort_key: 1, most_recent: true)
      end
    end
  end
end
