# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership::Tier, type: :model do
  describe 'Relations' do
    it { is_expected.to belong_to(:project) }

    it { is_expected.to have_many(:billing_options).class_name('Membership::BillingOption').dependent(:destroy) }
    it { is_expected.to have_many(:subscriptions).class_name('Membership::Subscription').dependent(:destroy) }
  end

  describe 'Before Validation' do
    subject(:tier) { create(:membership_tier, project_id: project.id, order: nil) }

    let(:project) { create(:subscription_project) }

    context 'when the order attribute is not populated and there are one or more tiers' do
      before do
        create(:membership_tier, order: 1, project: project)
        create(:membership_tier, order: 3, project: project)
      end

      it 'the order attribute is the highest value plus a unit' do
        expect(tier.order).to eq(4)
      end
    end

    context 'when the order attribute is not populated and there are no more tier' do
      it 'the order attribute is equal to one' do
        expect(tier.order).to eq(1)
      end
    end

    context 'when order attribute is populated on creation' do
      subject(:tier) { create(:membership_tier, project_id: project.id, order: 10) }

      before do
        create(:membership_tier, project: project, order: 1)
      end

      it 'there is no change in the attribute order' do
        expect(tier.order).to eq(10)
      end
    end

    context 'when an attribute is updated' do
      subject(:tier) { create(:membership_tier, project_id: project.id, order: 1) }

      before do
        create(:membership_tier, project: project, order: 5)
        tier.update(name: Faker::Lorem.sentence)
      end

      it 'there is no change in the attribute order' do
        expect(tier.order).to eq(1)
      end
    end
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:description) }

    it { is_expected.to validate_length_of(:name).is_at_most(512) }
    it { is_expected.to validate_length_of(:description).is_at_most(16_000) }

    it { is_expected.to validate_numericality_of(:subscribers_limit).is_greater_than(0).only_integer.allow_nil }
    it { is_expected.to validate_numericality_of(:order).only_integer }

    context 'when the project does have subscription mode' do
      let(:tier) { build(:membership_tier, project: project) }
      let(:project) { create(:subscription_project) }

      it 'doesn`t add invalid project error' do
        tier.valid?

        expect(tier.errors[:project_id]).to be_empty
      end
    end

    context 'when the project does not have subscription mode' do
      let(:tier) { build(:membership_tier, project: project) }

      %i[aon flex].each do |mode|
        let(:project) { create(:project, mode: mode.to_s) }

        it 'adds invalid project error message' do
          tier.valid?

          error_message = I18n.t('models.membership.tier.errors.invalid_project')
          expect(tier.errors[:project_id]).to include error_message
        end
      end
    end
  end
end
