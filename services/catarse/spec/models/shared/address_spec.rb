# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Shared::Address, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to :user }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:country_code) }
    it { is_expected.to validate_presence_of(:line_1) }
    it { is_expected.to validate_presence_of(:city) }
    it { is_expected.to validate_presence_of(:state) }

    it { is_expected.to validate_length_of(:postal_code).is_at_most(256) }
    it { is_expected.to validate_length_of(:country_code).is_at_most(2) }
    it { is_expected.to validate_length_of(:line_1).is_at_most(512) }
    it { is_expected.to validate_length_of(:line_2).is_at_most(512) }
    it { is_expected.to validate_length_of(:number).is_at_most(64) }
    it { is_expected.to validate_length_of(:neighborhood).is_at_most(128) }
    it { is_expected.to validate_length_of(:city).is_at_most(256) }
    it { is_expected.to validate_length_of(:state).is_at_most(256) }
    it { is_expected.to validate_length_of(:phone_number).is_at_most(64) }
    it { is_expected.to validate_length_of(:first_name).is_at_most(128) }
    it { is_expected.to validate_length_of(:last_name).is_at_most(128) }
    it { is_expected.to validate_length_of(:organization).is_at_most(128) }
  end
end
