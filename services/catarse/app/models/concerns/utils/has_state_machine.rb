# frozen_string_literal: true

module Utils
  module HasStateMachine
    extend ActiveSupport::Concern

    # To include this concern on your model, you need fill the following pre-requisites:
    # Supposing you are including this concern on `Integrations::Webhook` model.
    # - A state machine class. eg.: Integrations::WebhookStateMachine
    # - A transition model class. eg.: Integrations::WebhookStateTransition
    # - A initial state defined on Integrations::WebhookStateMachine
    #
    # Your model will get:
    # - has_many :state_transition
    # - state machine
    # - delegate some state machine methods to state_machine
    # - validation of presence and inclusion of state
    # - create a new state transition when model is created
    # - Some state machine related queries will be to class. eg.: Model.in_state(:processed)

    included do |base|
      state_machine_class = "#{base}StateMachine".constantize
      transition_class = "#{base}StateTransition".constantize
      transition_relation_name = :state_transitions

      include Statesman::Adapters::ActiveRecordQueries[
        transition_class: transition_class,
        initial_state: state_machine_class.initial_state,
        transition_name: transition_relation_name
      ]

      has_many transition_relation_name, class_name: "#{base}StateTransition", dependent: :destroy, autosave: false

      validates :state, presence: true
      validates :state, inclusion: { in: state_machine_class.states }

      after_create :create_inital_state_transition

      delegate :can_transition_to?, :current_state, :history, :last_transition, :transition_to!, :transition_to,
        :in_state?, to: :state_machine

      define_method :state_machine do
        @state_machine ||= state_machine_class.new(self,
          transition_class: transition_class,
          association_name: transition_relation_name
        )
      end

      private

      define_method :create_inital_state_transition do
        send(transition_relation_name).create(to_state: state, sort_key: 1, most_recent: true)
      end
    end
  end
end
