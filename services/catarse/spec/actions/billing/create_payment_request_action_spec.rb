require 'rails_helper'

RSpec.describe Billing::CreatePaymentRequestAction, type: :action do
  describe 'Behavior' do
    let(:context) { LightService::Context.make(user: user, payment_request_attributes: payment_request_attributes) }
    let(:user) { double }
    let(:payment_request_attributes) { double }

    let(:billing_address) { double }
    let(:payables) { double }
    let(:payment_request) { double }

    before do
      allow(described_class).to receive(:create_billing_address)
        .with(payment_request_attributes)
        .and_return(billing_address)

      allow(described_class).to receive(:find_payables)
        .with(payment_request_attributes)
        .and_return(payables)

      allow(described_class).to receive(:create_payment_request)
        .with(
          user: user,
          attributes: payment_request_attributes,
          billing_address: billing_address,
          payables: payables
        ).and_return(payment_request)
    end

    it 'creates billing address, payment requests and payment request items' do
      result = described_class.execute(context)
      expect(result.payment_request).to eq payment_request
    end
  end

  describe '.create_billing_address' do
    let(:country) { create(:country) }
    let(:state) { create(:state) }

    let(:attributes) do
      {
        billing_address: {
          country_id: country.id, state_id: state.id,
          line_1: 'Street A',
          number: '123',
          line_2: 'Ap 101',
          neighborhood: 'Downtown',
          city: 'Los Angeles',
          zip_code: '4215',
          phone_number: '(85) 1245-1251',
          state: 'California'
        }
      }
    end

    it 'creates an address' do
      billing_address = described_class.create_billing_address(attributes)
      expect(billing_address.country_id).to eq country.id
      expect(billing_address.state_id).to eq state.id
      expect(billing_address.address_street).to eq 'Street A'
      expect(billing_address.address_number).to eq '123'
      expect(billing_address.address_complement).to eq 'Ap 101'
      expect(billing_address.address_neighbourhood).to eq 'Downtown'
      expect(billing_address.address_city).to eq 'Los Angeles'
      expect(billing_address.address_zip_code).to eq '4215'
      expect(billing_address.phone_number).to eq '(85) 1245-1251'
      expect(billing_address.address_state).to eq 'California'
    end
  end

  describe '.find_payables' do
    let(:contribution) do
      create(
        :contribution,
        user: create(:user, :without_bank_data),
        project: create(:project, user: create(:user, :without_bank_data))
      )
    end
    let(:attributes) do
      { items: [{ payable_type: contribution.class.to_s, payable_id: contribution.id} ] }
    end

    it 'finds payable objects' do
      payables = described_class.find_payables(attributes)
      expect(payables).to eq [contribution]
    end

    xit 'test with subscription as payable'
  end

  describe '.create_payment_request' do
    let(:user) { create(:user, :without_bank_data) }
    let(:billing_address) { create(:address) }
    let(:contribution) do
      create(
        :contribution,
        user: create(:user, :without_bank_data),
        project: create(:project, user: create(:user, :without_bank_data))
      )
    end
    let(:payables) { [contribution] }
    let(:attributes) { { payment_method: 'credit_card', installments_count: 2 } }

    before do
      allow(described_class).to receive(:card_identifier).with(attributes).and_return({ gateway_card_id: 'card_id' })
    end

    it 'creates payment request' do
      payment_request = described_class.create_payment_request(
        user: user,
        attributes: attributes,
        billing_address: billing_address,
        payables: payables
      )

      expect(payment_request).to be_persisted
      expect(payment_request).to be_waiting_payment
      expect(payment_request.user).to eq user
      expect(payment_request.billing_address).to eq billing_address
      expect(payment_request.items.map(&:payable)).to eq payables
      expect(payment_request.payment_method).to eq :credit_card
      expect(payment_request.installments_count).to eq 2
      expect(payment_request.total_amount).to eq contribution.value
      expect(payment_request.gateway_card_id).to eq 'card_id'
    end
  end

  describe '.card_identifier' do
    context 'when gateway_card_id is present' do
      it 'returns gateway_card_id hash' do
        card_identifier = described_class.card_identifier({ gateway_card_id: '123' })

        expect(card_identifier).to eq(gateway_card_id: '123')
      end
    end

    context 'when gateway_card_hash is present' do
      it 'returns gateway_card_hash hash' do
        card_identifier = described_class.card_identifier({ gateway_card_hash: '123' })

        expect(card_identifier).to eq(gateway_card_hash: '123')
      end
    end
  end

  describe '.create_payment_request_items' do
    let!(:payment_request) { create(:payment_request, :credit_card) }
    let(:contribution) do
      create(
        :contribution,
        user: create(:user, :without_bank_data),
        project: create(:project, user: create(:user, :without_bank_data))
      )
    end
    let(:payables) { [contribution] }

    context 'when payment request items are created successfully' do
      it 'create payment request items from payables' do
        expect do
          described_class.create_payment_request_items(payment_request: payment_request, payables: payables)
        end.to change(payment_request.items, :count).by(1)
        expect(payment_request.items.map(&:payable)).to include contribution
      end
    end

    context 'when payment request item cannot be created' do
      let(:exception) { ActiveRecord::RecordInvalid.new(payment_request) }

      before do
        allow(payment_request.items).to receive(:create!).and_raise(exception)
      end

      it 'destroys payment request and payment request billing address' do
        described_class.create_payment_request_items(payment_request: payment_request, payables: payables) rescue nil
        expect(payment_request.billing_address).to be_destroyed
        expect(payment_request).to be_destroyed
      end

      it 'raises exception' do
        expect do
          described_class.create_payment_request_items(payment_request: payment_request, payables: payables)
        end.to raise_error(exception)
      end
    end
  end
end
