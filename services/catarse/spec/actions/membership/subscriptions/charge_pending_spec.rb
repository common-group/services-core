# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Subscriptions::ChargePending, type: :action do
  describe 'Inputs' do
    subject { described_class.inputs }

    it { is_expected.to be_empty }
  end

  describe 'Outputs' do
    subject { described_class.outputs }

    it { is_expected.to be_empty }
  end

  describe '#call' do
    pending 'Implement tests'
  end
end
