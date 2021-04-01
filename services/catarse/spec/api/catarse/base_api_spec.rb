# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::BaseAPI, type: :api do
  describe 'Mounted apps' do
    it 'mounts Catarse::V2::BaseAPI app' do
      expect(described_class.routes.to_a).to include(*Catarse::V2::BaseAPI.routes.to_a)
    end
  end
end
