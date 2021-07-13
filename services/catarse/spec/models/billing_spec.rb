# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing, type: :model do
  describe '.table_name_prefix' do
    it 'returns `billing_`' do
      expect(described_class.table_name_prefix).to eq 'billing_'
    end
  end
end
