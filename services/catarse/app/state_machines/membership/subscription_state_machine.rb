# frozen_string_literal: true

module Membership
  class SubscriptionStateMachine
    include Statesman::Machine

    state :started, initial: true
    state :active
    state :canceling
    state :canceled
    state :inactive
    state :deleted

    transition from: :started, to: %i[active deleted]
    transition from: :active, to: %i[canceling inactive]
    transition from: :canceling, to: %i[canceled]
    transition from: :inactive, to: %i[active]

    after_transition(after_commit: true) do |subscription, transition|
      subscription.update!(state: transition.to_state)
    end
  end
end
