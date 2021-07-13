# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentMethods, type: :enumeration do
  describe '.list' do
    subject { described_class.list }

    it { is_expected.to include('credit_card') }
    it { is_expected.to include('pix') }
    it { is_expected.to include('boleto') }
  end
end
