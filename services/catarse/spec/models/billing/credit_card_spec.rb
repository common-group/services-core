# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::CreditCard, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:billing_address).class_name('Common::Address') }

    it { is_expected.to have_many(:payments).class_name('Billing::Payment').dependent(:nullify) }
  end

  describe 'Configurations' do
    it 'setups gateway with Billing::Gateways enum' do
      expect(described_class.enumerations).to include(gateway: Billing::Gateways)
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:billing_address_id) }
    it { is_expected.to validate_presence_of(:gateway) }
    it { is_expected.to validate_presence_of(:gateway_id) }
    it { is_expected.to validate_presence_of(:holder_name) }
    it { is_expected.to validate_presence_of(:bin) }
    it { is_expected.to validate_presence_of(:last_digits) }
    it { is_expected.to validate_presence_of(:country) }
    it { is_expected.to validate_presence_of(:brand) }
    it { is_expected.to validate_presence_of(:expires_on) }

    context 'when billing address owner matches user' do
      subject(:credit_card) do
        described_class.new(user: user, billing_address: address)
      end

      let(:address) { create(:common_address) }
      let(:user) { address.user }

      it 'doesn`t add invalid_billing_address error' do
        credit_card.valid?

        expect(credit_card.errors[:billing_address_id]).to be_empty
      end
    end

    context 'when billing address owner doesn`t match user' do
      subject(:credit_card) do
        described_class.new(user: user, user_id: user.id, billing_address: billing_address)
      end

      let(:address) { create(:common_address) }
      let(:user) { address.user }
      let(:billing_address) { create(:common_address) }

      it 'adds invalid billing address error message' do
        credit_card.valid?

        error_message = I18n.t('models.billing.credit_card.errors.invalid_billing_address')
        expect(credit_card.errors[:billing_address_id]).to include error_message
      end
    end
  end

  describe 'Scopes' do
    describe '#safelist' do
      it 'returns safelist query' do
        expect(Billing::CreditCards::SafelistQuery).to receive(:call)

        described_class.safelist
      end
    end
  end
end
