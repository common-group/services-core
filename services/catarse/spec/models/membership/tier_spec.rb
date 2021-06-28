# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Tier, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:project) }

    it { is_expected.to have_many(:billing_options).class_name('Membership::BillingOption').dependent(:destroy) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:description) }

    it { is_expected.to validate_length_of(:name).is_at_most(512) }
    it { is_expected.to validate_length_of(:description).is_at_most(16_000) }

    it { is_expected.to validate_numericality_of(:subscribers_limit).is_greater_than(0).only_integer.allow_nil }
    it { is_expected.to validate_numericality_of(:order).only_integer }
  end
end
