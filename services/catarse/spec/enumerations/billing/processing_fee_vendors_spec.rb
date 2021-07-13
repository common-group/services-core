# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::ProcessingFeeVendors, type: :enumeration do
  describe '.list' do
    subject { described_class.list }

    it { is_expected.to include('konduto') }
    it { is_expected.to include('pagar_me') }
  end
end
