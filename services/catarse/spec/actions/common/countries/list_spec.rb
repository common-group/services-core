# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Common::Countries::List, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to be_empty }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to include(countries: { type: Array }) }
  end

  describe '#call' do
    subject(:result) { described_class.result }

    it { is_expected.to be_success }

    it 'returns countries' do
      countries_list = ISO3166::Country.translations.map { |attr| { code: attr.first, name: attr.last } }

      expect(result.countries).to eq(countries_list)
    end
  end
end
