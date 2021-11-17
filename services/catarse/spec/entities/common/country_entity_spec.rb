# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Common::CountryEntity, type: :entity do
  let(:resource) { ISO3166::Country['BR'] }
  let(:serializable_hash) { described_class.new(resource) }

  it 'exposes code' do
    expect(serializable_hash.serializable_hash[:code]).to eq resource.alpha2
  end

  it 'exposes name' do
    expect(serializable_hash.serializable_hash[:name]).to eq resource.translation(I18n.locale)
  end
end
