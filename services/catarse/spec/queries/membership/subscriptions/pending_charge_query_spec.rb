# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscriptions::PendingChargeQuery, type: :query do
  subject(:query) { described_class.new }

  describe '#call' do
    let!(:subscription) { create(:membership_subscription, :active, :pending_charge) }

    before do
      not_active_states = Membership::SubscriptionStateMachine.states - ['active']
      not_active_states.each do |state|
        create(:membership_subscription, :pending_charge, state: state)
      end

      # TODO: create subscription with pending payments
    end

    it 'returns credit cards used on paid payments' do
      expect(query.call).to eq [subscription]
    end
  end
end
