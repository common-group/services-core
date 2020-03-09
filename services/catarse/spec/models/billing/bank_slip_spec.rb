require 'rails_helper'

RSpec.describe Billing::BankSlip, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment_request).class_name('Billing::PaymentRequest') }
  end

  describe 'Indexes' do
    it { is_expected.to have_db_index(:payment_request_id).unique(false) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_request_id) }
    it { is_expected.to validate_presence_of(:gateway) }
    it { is_expected.to validate_presence_of(:barcode) }
    it { is_expected.to validate_presence_of(:url) }
    it { is_expected.to validate_presence_of(:expires_on) }
  end
end
