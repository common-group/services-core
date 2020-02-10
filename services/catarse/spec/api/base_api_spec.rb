require 'rails_helper'

RSpec.describe Catarse::BaseAPI, type: :api do
  describe 'Mounted apps' do
    it 'mounts Catarse::V2::BaseAPI app' do
      expect(described_class.routes).to match(Catarse::V2::BaseAPI.routes)
    end
  end
end
