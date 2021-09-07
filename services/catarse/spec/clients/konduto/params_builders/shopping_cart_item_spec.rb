# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Konduto::ParamsBuilders::ShoppingCartItem, type: :params_builder do
  subject(:params_builder) { described_class.new(payment_item) }

  let(:payable) { Contribution.new }
  let(:payment_item) { Billing::PaymentItem.new(payment_item_attributes) }
  let(:payment_item_attributes) { { payable: payable } }

  describe 'ATTRIBUTES constant' do
    it 'returns params attributes' do
      expect(described_class::ATTRIBUTES).to eq %i[
        sku product_code created_at category name description unit_cost quantity
      ]
    end
  end

  describe '#build' do
    let(:payment_item) { create(:billing_payment_item, :contribution) }

    it 'returns all attributes with corresponding methods results' do
      expect(params_builder.build).to eq(
        sku: params_builder.sku,
        product_code: params_builder.product_code,
        created_at: params_builder.created_at,
        category: params_builder.category,
        name: params_builder.name,
        description: params_builder.description,
        unit_cost: params_builder.unit_cost,
        quantity: params_builder.quantity
      )
    end
  end

  describe '#sku' do
    context 'when object is reward' do
      let(:reward) { Reward.new(id: Faker::Number.number) }
      let(:payable) { Contribution.new({ reward: reward }) }

      it 'returns reward id is string' do
        expect(params_builder.sku).to eq reward.id.to_s
      end
    end

    context 'when object is tier' do
      let(:tier) { Membership::Tier.new(id: Faker::Number.number) }
      let(:payable) { Membership::Subscription.new({ tier: tier }) }

      it 'returns tier id is string' do
        expect(params_builder.sku).to eq tier.id.to_s
      end
    end

    context 'when object is project' do
      let(:project) { Project.new(id: Faker::Number.number) }
      let(:payable) { Contribution.new({ project: project }) }

      it 'returns project id is string' do
        expect(params_builder.sku).to eq project.id.to_s
      end
    end
  end

  describe '#product_code' do
    context 'when object is reward' do
      let(:reward) { Reward.new(id: Faker::Number.number) }
      let(:payable) { Contribution.new({ reward: reward }) }

      it 'returns reward id is string' do
        expect(params_builder.product_code).to eq reward.id.to_s
      end
    end

    context 'when object is tier' do
      let(:tier) { Membership::Tier.new(id: Faker::Number.number) }
      let(:payable) { Membership::Subscription.new({ tier: tier }) }

      it 'returns tier id is string' do
        expect(params_builder.product_code).to eq tier.id.to_s
      end
    end

    context 'when object is project' do
      let(:project) { Project.new(id: Faker::Number.number) }
      let(:payable) { Contribution.new({ project: project }) }

      it 'returns project id is string' do
        expect(params_builder.product_code).to eq project.id.to_s
      end
    end
  end

  describe '#created_at' do
    context 'when object is reward' do
      let(:reward) { Reward.new(created_at: Faker::Time.backward(days: 30)) }
      let(:payable) { Contribution.new({ reward: reward }) }

      it 'returns reward created_at using iso8601 format' do
        expect(params_builder.created_at).to eq reward.created_at.to_date.iso8601
      end
    end

    context 'when object is tier' do
      let(:tier) { Membership::Tier.new(created_at: Faker::Time.backward(days: 30)) }
      let(:payable) { Membership::Subscription.new({ tier: tier }) }

      it 'returns tier created_at using iso8601 format' do
        expect(params_builder.created_at).to eq tier.created_at.to_date.iso8601
      end
    end

    context 'when object is project' do
      let(:project) { Project.new(created_at: Faker::Time.backward(days: 30)) }
      let(:payable) { Contribution.new({ project: project }) }

      it 'returns project created_at using iso8601 format' do
        expect(params_builder.created_at).to eq project.created_at.to_date.iso8601
      end
    end
  end

  describe '#category' do
    it 'returns 9999' do
      expect(params_builder.category).to eq 9999
    end
  end

  describe '#name' do
    let(:project) { Project.new(name: Faker::Lorem.sentence[0..99]) }
    let(:payable) { Contribution.new({ project: project }) }

    it 'returns project name' do
      expect(params_builder.name).to eq project.name
    end
  end

  describe '#description' do
    let(:payable) { Contribution.new({ reward: reward }) }

    context 'when tier is present' do
      let(:payable) { Membership::Subscription.new({ tier: tier }) }
      let(:tier) { Membership::Tier.new(name: Faker::Lorem.sentence[0..99]) }

      it 'returns tier name' do
        expect(params_builder.description).to eq tier.name
      end
    end

    context 'when reward is present' do
      let(:reward) { Reward.new(description: Faker::Lorem.sentence[0..99]) }

      it 'returns reward description' do
        expect(params_builder.description).to eq reward.description
      end
    end

    context 'when reward is nil' do
      let(:reward) { nil }

      it 'returns empty string' do
        expect(params_builder.description).to eq ''
      end
    end
  end

  describe '#unit_cost' do
    let(:payment_item_attributes) { { payable: payable, amount: Faker::Number.number(digits: 4) } }

    it 'returns payment item amount as decimal' do
      expect(params_builder.unit_cost).to eq payment_item.amount.to_f
    end
  end

  describe '#quantity' do
    it 'returns 1' do
      expect(params_builder.quantity).to eq 1
    end
  end
end
