# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Billing::PaymentItem, type: :model do
  it_behaves_like 'has state machine' do
    let(:record) { create(:billing_payment_item, :contribution) }
  end

  describe 'Constants' do
    describe 'ALLOWED_PAYABLE_TYPES' do
      it 'returns contribution and subscriptions class names' do
        expect(described_class::ALLOWED_PAYABLE_TYPES).to eq %w[Contribution Membership::Subscription]
      end
    end
  end

  describe 'Relations' do
    it { is_expected.to belong_to :payment }
    it { is_expected.to belong_to :payable }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of :payable_id }
    it { is_expected.to validate_presence_of :payable_type }

    it do
      payment_item = create(:billing_payment_item, :contribution)
      expect(payment_item).to validate_uniqueness_of(:payable_id).scoped_to(:payable_type, :payment_id).case_insensitive
    end

    it { is_expected.to validate_numericality_of(:amount).is_greater_than_or_equal_to(1) }
    it { is_expected.to validate_numericality_of(:shipping_fee).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than_or_equal_to(1) }

    it { is_expected.to validate_inclusion_of(:payable_type).in_array(described_class::ALLOWED_PAYABLE_TYPES) }

    context 'when the payment and payable user are the same' do
      subject(:payment_item) { described_class.new(payment: payment, payable: payable) }

      let(:payment) { Billing::Payment.new(user: User.new(id: 1)) }
      let(:payable) { Contribution.new(id: 1, user: User.new(id: 1)) }

      it 'doesn`t add invalid user error' do
        payment_item.valid?

        expect(payment_item.errors[:payable]).to be_empty
      end
    end

    context 'when the payment and payable user are different' do
      subject(:payment_item) { described_class.new(payment: payment, payable: payable) }

      let(:payment) { Billing::Payment.new(user: User.new(id: 1)) }
      let(:payable) { Contribution.new(id: 1, user: User.new(id: 2)) }

      it 'adds invalid invalid user error message' do
        payment_item.valid?

        error_message = I18n.t('models.billing.payment_item.errors.invalid_user')
        expect(payment_item.errors[:payable]).to include error_message
      end
    end
  end

  describe 'Delegations' do
    %i[settle! cancel! refund! chargeback!].each do |method|
      it { is_expected.to delegate_method(method).to(:state_machine) }
    end
  end

  describe 'Scopes' do
    describe '.subscriptions' do
      let!(:sub_payment_item) { create(:billing_payment_item, :subscription) }

      before { create(:billing_payment_item, :contribution) }

      it 'returns payment items where payable is a subscription' do
        expect(described_class.subscriptions.to_a).to eq [sub_payment_item]
      end
    end

    describe '.contributions' do
      let!(:contribution_payment_item) { create(:billing_payment_item, :contribution) }

      before { create(:billing_payment_item, :subscription) }

      it 'returns payment items where payable is a contribution' do
        expect(described_class.contributions.to_a).to eq [contribution_payment_item]
      end
    end
  end

  describe '#subscription?' do
    subject { described_class.new(payable_type: payable_type) }

    context 'when payable type is Membership::Subscription' do
      let(:payable_type) { 'Membership::Subscription' }

      it { is_expected.to be_subscription }
    end

    context 'when payable type isn`t Membership::Subscription' do
      let(:payable_type) { (described_class::ALLOWED_PAYABLE_TYPES - ['Membership::Subscription']).sample }

      it { is_expected.not_to be_subscription }
    end
  end

  describe '#contribution?' do
    subject { described_class.new(payable_type: payable_type) }

    context 'when payable type is Contribution' do
      let(:payable_type) { 'Contribution' }

      it { is_expected.to be_contribution }
    end

    context 'when payable type isn`t Contribution' do
      let(:payable_type) { (described_class::ALLOWED_PAYABLE_TYPES - ['Contribution']).sample }

      it { is_expected.not_to be_contribution }
    end
  end
end
