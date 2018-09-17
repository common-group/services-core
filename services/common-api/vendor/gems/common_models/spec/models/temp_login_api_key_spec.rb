# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'

RSpec.describe CommonModels::TempLoginApiKey, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to :platform }
    it { is_expected.to belong_to :user }
  end

  describe 'validations' do
    %w[token platform_id user_id expires_at].each do |field|
      it { is_expected.to validate_presence_of field }
    end
  end

  describe 'scopes' do
    describe '.not_expired' do
      context 'when all keys are expired' do
        before do
          2.times do |i|
            create(:temp_login_api_key, expires_at: i.days.ago)
          end
        end
        subject { CommonModels::TempLoginApiKey.not_expired.to_a }
        it { is_expected.to eq([]) }
      end

      context 'when have at least one not expired' do
        let!(:not_expired) { create(:temp_login_api_key) }
        before do
          2.times do |i|
            create(:temp_login_api_key, expires_at: i.days.ago)
          end
        end

        subject { CommonModels::TempLoginApiKey.not_expired.to_a }
        it { is_expected.to eq([not_expired]) }
      end
    end
  end

  describe '#expire!' do
    let!(:not_expired) { create(:temp_login_api_key) }
    subject { not_expired.expired? }
    before do
      not_expired.expire!
      not_expired.reload
    end

    it { expect(not_expired.expired?).to be(true) }
  end

  describe '#expired?' do
    let!(:not_expired) { create(:temp_login_api_key) }

    it 'false when not expired' do
      expect(not_expired.expired?).to be(false)
    end

    it 'true when not expired' do
      not_expired.expire!
      expect(not_expired.expired?).to be(true)
    end
  end

  describe '.gen_random_key' do
    subject { CommonModels::TempLoginApiKey.gen_random_key }
    it { is_expected.to match(/^temp_login_api_key_(\w+){0,50}/) }
  end
end
