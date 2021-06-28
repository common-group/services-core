# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::BillingOption, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:tier).class_name('Membership::Tier') }
  end

  describe 'Validations' do
    it { is_expected.to validate_numericality_of(:cadence_in_months).is_equal_to(1).only_integer }
    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
  end
end
