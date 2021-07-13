# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Integrations, type: :model do
  describe '.table_name_prefix' do
    it 'returns `integrations_`' do
      expect(described_class.table_name_prefix).to eq 'integrations_'
    end
  end
end
