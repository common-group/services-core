require 'rails_helper'

RSpec.describe Billing::Antifraud::Konduto::TransactionParamsBuilder, type: :lib do
  subject { described_class.new(payment_request) }

  let(:payment_request) { create(:payment_request, :credit_card) }

  describe 'Public methods' do
    describe '#build' do
      let(:customer_params) { double }
      let(:payment_params) { double }
      let(:billing_params) { double }
      let(:shopping_cart_params) { double }

      before do
        allow(subject).to receive(:customer_params).and_return(customer_params)
        allow(subject).to receive(:payment_params).and_return(payment_params)
        allow(subject).to receive(:billing_params).and_return(billing_params)
        allow(subject).to receive(:shopping_cart_params).and_return(shopping_cart_params)
      end

      it 'builds params to send to Konduto' do
        expect(subject.build).to include(
          id: payment_request.id,
          ip: payment_request.user.current_sign_in_ip,
          total_amount: payment_request.total_amount.to_f,
          purchased_at: payment_request.created_at.utc.iso8601,
          customer: customer_params,
          billing: billing_params,
          shipping: billing_params,
          shopping_cart: shopping_cart_params
        )
      end

      context 'when payment request is authorized' do
        let(:payment_request) { create(:payment_request, :credit_card, state: :authorized) }

        it 'sets analyze to true' do
          expect(subject.build).to include(analyze: true)
        end
      end

      context 'when payment request isn`t authorized' do
        let(:payment_request) { create(:payment_request, :credit_card, state: :refused) }

        it 'sets analyze to false' do
          expect(subject.build).to include(analyze: false)
        end
      end
    end
  end

  describe 'Private methods' do
    describe '#customer_params' do
      it 'builds customer params' do
        expect(subject.send(:customer_params)).to eq(
          id: payment_request.user.id.to_s,
          name: payment_request.user.name,
          email: payment_request.user.email,
          dob: payment_request.user.birth_date.iso8601,
          phone1: payment_request.user.phone_number,
          created_at: payment_request.user.created_at.to_date.iso8601
        )
      end
    end

    describe '#payment_params' do
      let!(:credit_card) { create(:new_credit_card, owner: payment_request) }

      it 'builds payment params' do
        expect(subject.send(:payment_params).first).to include(
          type: 'credit',
          bin: payment_request.credit_card.first_digits,
          last4: payment_request.credit_card.last_digits,
          expiration_date: payment_request.credit_card.expires_on.strftime('%m%Y')
        )
      end

      context 'when payment request is authorized' do
        let(:payment_request) { create(:payment_request, :credit_card, state: :authorized) }

        it 'sets status to approved' do
          expect(subject.send(:payment_params).first).to include(status: 'approved')
        end
      end

      context 'when payment request isn`t authorized' do
        let(:payment_request) { create(:payment_request, :credit_card, state: :refused) }

        it 'sets status to declined' do
          expect(subject.send(:payment_params).first).to include(status: 'declined')
        end
      end
    end

    describe '#billing_params' do
      let!(:credit_card) { create(:new_credit_card, owner: payment_request) }

      it 'builds billing params' do
        expect(subject.send(:billing_params)).to include(
          name: credit_card.holder_name,
          address1: payment_request.billing_address.address_street,
          address2: payment_request.billing_address.address_complement,
          city: payment_request.billing_address.address_city,
          zip: payment_request.billing_address.address_zip_code
        )
      end

      context 'when address country has code' do
        before { allow(payment_request.billing_address.country).to receive(:code).and_return('US') }

        it 'sets country code' do
          expect(subject.send(:billing_params)).to include(country: 'US')
        end
      end

      context 'when address country hasn`t code' do
        before { allow(payment_request.billing_address.country).to receive(:code).and_return(nil) }

        it 'doesn`t set country code' do
          expect(subject.send(:billing_params)).to_not have_key(:country)
        end
      end

      context 'when address has address_state' do
        before { allow(payment_request.billing_address).to receive(:address_state).and_return('California') }

        it 'sets address_state as state' do
          expect(subject.send(:billing_params)).to include(state: 'California')
        end
      end

      context 'when address hasn`t address_state' do
        before do
          allow(payment_request.billing_address).to receive(:address_state).and_return(nil)
          allow(payment_request.billing_address).to receive(:state).and_return(double(name: 'Ceará'))
        end

        it 'sets state.name as state' do
          expect(subject.send(:billing_params)).to include(state: 'Ceará')
        end
      end
    end

    describe '#shopping_cart_params' do
      let(:item) { payment_request.items.first }

      it 'builds shopping cart params' do
        expect(subject.send(:shopping_cart_params).first).to include(
          category: 9999,
          name: "#{item.amount.to_s} - #{item.payable.project.name}",
          unit_cost: item.amount.to_f,
          quantity: 1
        )
      end

      context 'when payable has reward' do
        let(:reward) { create(:reward, project: item.payable.project) }

        before do
          item.payable.update!(reward_id: reward.id)
          payment_request.reload
        end

        it 'extracts sku, product code and created at from reward' do
          expect(subject.send(:shopping_cart_params).first).to include(
            sku: reward.id.to_s,
            product_code: reward.id.to_s,
            created_at: reward.created_at.to_date.iso8601
          )
        end
      end

      context 'when payable hasn`t reward' do
        it 'extracts sku, product code and created at from project' do
          expect(subject.send(:shopping_cart_params).first).to include(
            sku: item.payable.project.id.to_s,
            product_code: item.payable.project.id.to_s,
            created_at: item.payable.project.created_at.to_date.iso8601
          )
        end
      end
    end
  end
end
