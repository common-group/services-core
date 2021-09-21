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
    subject(:result) { described_class.result }

    let(:scope) { instance_double(ActiveRecord::Relation) }
    let(:sub_a) { Membership::Subscription.new }
    let(:sub_b) { Membership::Subscription.new }

    before do
      allow(Membership::Subscription).to receive(:pending_charge).and_return(scope)
      allow(scope).to receive(:find_each).and_yield(sub_a).and_yield(sub_b)
    end

    it 'charges pending subscriptions' do
      [sub_a, sub_b].each do |sub|
        expect(Membership::Subscriptions::Charge).to receive(:result).with(subscription: sub)
      end

      result
    end
  end
end
