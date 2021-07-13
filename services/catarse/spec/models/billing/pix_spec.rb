# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::Pix, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment).class_name('Billing::Payment') }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_id) }
    it { is_expected.to validate_presence_of(:key) }
    it { is_expected.to validate_presence_of(:expires_on) }
  end
end
