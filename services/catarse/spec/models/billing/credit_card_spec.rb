require 'rails_helper'

RSpec.describe Billing::CreditCard, type: :model do
  describe 'Configuration' do
    it 'has `new_credit_cards` as table_name' do
      expect(described_class.table_name).to eq 'new_credit_cards'
    end
  end

  describe 'Relations' do
    it { is_expected.to belong_to(:owner) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:owner_id) }
    it { is_expected.to validate_presence_of(:owner_type) }
    it { is_expected.to validate_presence_of(:gateway) }
    it { is_expected.to validate_presence_of(:gateway_id) }
    it { is_expected.to validate_presence_of(:holder_name) }
    it { is_expected.to validate_presence_of(:first_digits) }
    it { is_expected.to validate_presence_of(:last_digits) }
    it { is_expected.to validate_presence_of(:expires_on) }
  end

  describe 'Scopes' do
    describe '.safelist' do
      let(:paid_payment_request) { create(:payment_request, :credit_card, state: :paid) }
      let(:created_payment_request) { create(:payment_request, :credit_card, state: :created) }
      let(:refunded_payment_request) { create(:payment_request, :credit_card, state: :refunded) }

      let(:safe_credit_card) { create(:new_credit_card, owner: paid_payment_request) }
      let(:unsafe_credit_card_a) { create(:new_credit_card, owner: created_payment_request) }
      let(:unsafe_credit_card_b) { create(:new_credit_card, owner: refunded_payment_request) }

      it 'returns credit cards that have paid payment request' do
        expect(described_class.safelist).to include safe_credit_card
        expect(described_class.safelist).to_not include unsafe_credit_card_a
        expect(described_class.safelist).to_not include unsafe_credit_card_b
      end
    end
  end
end
