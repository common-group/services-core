# coding: utf-8
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reward, type: :model do
  let(:reward) { create(:reward, description: 'envie um email para foo@bar.com') }

  describe 'Index on common' do
    context 'whould index on common api after save' do
      before do
        expect(reward).to receive(:index_on_common)
      end

      it { reward.update(description: 'foo bar') }
    end
  end

  describe 'Log modifications' do
    describe 'when change something' do
      before do
        reward.update(description: 'foo')
      end

      it 'should save the last changes' do
        expect(reward.last_changes).to eq('{"description":["envie um email para foo@bar.com","foo"]}')
      end
    end
  end

  describe 'Associations' do
    it { is_expected.to belong_to :project }
    it { is_expected.to have_many :contributions }
    it { is_expected.to have_many(:payments).through(:contributions) }
    it { is_expected.to have_one(:reward_metric_storage).dependent(:destroy) }
    it { is_expected.to have_many(:shipping_fees).dependent(:destroy) }
  end

  it 'should have a minimum value' do
    r = build(:reward, minimum_value: nil)
    expect(r).not_to be_valid
  end

  describe 'check_if_is_destroyable' do
    before do
      create(:confirmed_contribution, project: reward.project, reward: reward)
      reward.reload
      reward.destroy
    end

    it { expect(reward.persisted?).to eq(true) }
  end

  it 'should have a greater than 10.00 minimum value' do
    r = build(:reward)
    r.minimum_value = -0.01
    expect(r).not_to be_valid
    r.minimum_value = 9.99
    expect(r).not_to be_valid
    r.minimum_value = 10.00
    expect(r).to be_valid
    r.minimum_value = 10.01
    expect(r).to be_valid
  end

  it 'should have a description' do
    r = build(:reward, description: nil)
    expect(r).not_to be_valid
  end

  it 'should have integer maximum contributions' do
    r = build(:reward)
    r.maximum_contributions = 10.01
    expect(r).not_to be_valid
    r.maximum_contributions = 10
    expect(r).to be_valid
  end

  it 'should have maximum contributions > 0' do
    r = build(:reward)
    r.maximum_contributions = -1
    expect(r).not_to be_valid
    r.maximum_contributions = 0
    expect(r).not_to be_valid
    r.maximum_contributions = 1
    expect(r).to be_valid
  end

  describe '.remaining' do
    let(:project) { create(:project) }
    subject { Reward.remaining }
    before do
      project.rewards.first.destroy!
      @remaining = create(:reward, maximum_contributions: 3, project: project)
      create(:confirmed_contribution, reward: @remaining, project: @remaining.project)
      create(:pending_contribution, reward: @remaining, project: @remaining.project)
      payment = create(:pending_contribution, reward: @remaining, project: @remaining.project).payments.first
      payment.update_column(:created_at, 9.days.ago)

      @sold_out = create(:reward, maximum_contributions: 2, project: project)
      create(:confirmed_contribution, reward: @sold_out, project: @sold_out.project)
      create(:pending_contribution, reward: @sold_out, project: @sold_out.project)
    end

    it { is_expected.to eq([@remaining]) }
  end

  describe '#total_contributions' do
    before do
      @remaining = create(:reward, maximum_contributions: 20)
      create(:confirmed_contribution, reward: @remaining, project: @remaining.project)
      create(:pending_contribution, reward: @remaining, project: @remaining.project)
      create(:refunded_contribution, reward: @remaining, project: @remaining.project)
    end

    context 'get total of paid and peding contributions' do
      subject { @remaining.total_contributions %w[paid pending] }

      it { is_expected.to eq(2) }
    end

    context 'get total of refunded contributions' do
      subject { @remaining.total_contributions %w[refunded] }

      it { is_expected.to eq(1) }
    end

    context 'get tota of pending contributions' do
      subject { @remaining.total_contributions %w[pending] }

      it { is_expected.to eq(1) }
    end
  end

  describe '#total_compromised' do
    before do
      @remaining = create(:reward, maximum_contributions: 20)
      create(:confirmed_contribution, reward: @remaining, project: @remaining.project)
      create(:pending_contribution, reward: @remaining, project: @remaining.project)
      payment = create(:pending_contribution, reward: @remaining, project: @remaining.project).payments.first
      payment.update_column(:created_at, 8.days.ago)
    end

    subject { @remaining.total_compromised }

    it { is_expected.to eq(2) }
  end

  describe '#in_time_to_confirm' do
    before do
      @remaining = create(:reward, maximum_contributions: 20)
      create(:confirmed_contribution, reward: @remaining, project: @remaining.project)
      create(:pending_contribution, reward: @remaining, project: @remaining.project)
      payment = create(:pending_contribution, reward: @remaining, project: @remaining.project).payments.first
      payment.update_column(:created_at, 8.days.ago)
    end

    subject { @remaining.in_time_to_confirm }

    it { is_expected.to eq(1) }
  end

  describe '#sold_out?' do
    let(:reward) { create(:reward, maximum_contributions: 3) }
    subject { reward.sold_out? }

    context 'when reward not have limits' do
      let(:reward) { create(:reward, maximum_contributions: nil) }
      it { is_expected.to eq(false) }
    end

    context 'when reward contributions waiting confirmation and confirmed are greater than limit' do
      before do
        2.times { create(:confirmed_contribution, reward: reward, project: reward.project) }
        create(:pending_contribution, reward: reward, project: reward.project)
      end

      it { is_expected.to eq(true) }
    end

    context 'when reward contributions waiting confirmation and confirmed are lower than limit' do
      before do
        create(:confirmed_contribution, reward: reward, project: reward.project)
        create(:pending_contribution, reward: reward, project: reward.project)
      end
      it { is_expected.to eq(false) }
    end
  end

  describe '.refresh_reward_metric_storage' do
    let(:reward) { create(:reward, maximum_contributions: 20) }
    before do
      create(:confirmed_contribution, reward: reward, project: reward.project)
      create(:pending_contribution, reward: reward, project: reward.project)
      payment = create(:pending_contribution, reward: reward, project: reward.project).payments.first
      payment.update_column(:created_at, 8.days.ago)

      reward.refresh_reward_metric_storage
    end

    subject { reward.reward_metric_storage }

    it "should have paid_count" do
      expect(subject.data['paid_count']).to eq(1)
    end

    it "should have waiting_payment_count" do
      expect(subject.data['waiting_payment_count']).to eq(1)
    end
  end
end
