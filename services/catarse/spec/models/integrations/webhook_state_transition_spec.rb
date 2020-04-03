require 'rails_helper'

RSpec.describe Integrations::WebhookStateTransition, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:webhook).class_name('Integrations::Webhook') }
  end

  describe 'Indexes' do
    it { is_expected.to have_db_index(:webhook_id).unique(false) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:webhook_id) }

    it do
      is_expected.to validate_inclusion_of(:to_state)
        .in_array(Integrations::Webhook.aasm.states.map(&:name).map(&:to_s))
    end

    it do
      is_expected.to validate_inclusion_of(:from_state)
        .in_array(Integrations::Webhook.aasm.states.map(&:name).map(&:to_s)).allow_nil
    end
  end
end
