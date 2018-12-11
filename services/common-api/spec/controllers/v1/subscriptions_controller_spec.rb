# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::SubscriptionsController, type: :controller do
  describe 'routes' do
    it { should route(:post, '/v1/subscriptions/10/set_anonymity_state').to(action: :set_anonymity_state, id: 10) }
  end

  describe 'filters' do
    it { should use_before_action(:authenticate_user!) }
  end
end
