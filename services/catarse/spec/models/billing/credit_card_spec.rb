# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::CreditCard, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:user) }

    it { is_expected.to have_many(:payments).class_name('Billing::Payment').dependent(:nullify) }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:user_id) }
    it { is_expected.to validate_presence_of(:gateway) }
    it { is_expected.to validate_presence_of(:gateway_id) }
    it { is_expected.to validate_presence_of(:holder_name) }
    it { is_expected.to validate_presence_of(:bin) }
    it { is_expected.to validate_presence_of(:last_digits) }
    it { is_expected.to validate_presence_of(:country) }
    it { is_expected.to validate_presence_of(:brand) }
    it { is_expected.to validate_presence_of(:expires_on) }
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
