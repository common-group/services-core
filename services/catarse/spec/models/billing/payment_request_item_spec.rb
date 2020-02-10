require 'rails_helper'

RSpec.describe Billing::PaymentRequestItem, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:payment_request).class_name('Billing::PaymentRequest') }
    it { is_expected.to belong_to(:payable) }
  end

  describe 'Indexes' do
    it { is_expected.to have_db_index(:payment_request_id).unique(false) }
    it { is_expected.to have_db_index(%i[payable_type payable_id]).unique(false) }
    it { is_expected.to have_db_index(%i[payment_request_id payable_type payable_id]).unique(true) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:payment_request_id) }
    it { is_expected.to validate_presence_of(:payable_type) }
    it { is_expected.to validate_presence_of(:payable_id) }
    it { is_expected.to validate_presence_of(:amount) }

    it do
      create(:payment_request_item)
      is_expected.to validate_uniqueness_of(:payable_id).scoped_to(:payment_request_id, :payable_type)
    end

    it { is_expected.to validate_numericality_of(:amount).is_greater_than(0) }
  end
end
