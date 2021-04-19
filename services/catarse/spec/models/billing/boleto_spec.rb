require 'rails_helper'

RSpec.describe Billing::Boleto, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment).class_name('Billing::Payment') }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_id) }
    it { is_expected.to validate_presence_of(:barcode) }
    it { is_expected.to validate_presence_of(:url) }
    it { is_expected.to validate_presence_of(:expires_at) }
  end
end
