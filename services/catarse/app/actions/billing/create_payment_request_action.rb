module Billing
  class CreatePaymentRequestAction
    extend LightService::Action

    expects :user
    expects :payment_request_attributes

    promises :payment_request

    executed do |context|
      billing_address = create_billing_address(context.payment_request_attributes)
      payables = find_payables(context.payment_request_attributes)

      context.payment_request = create_payment_request(
        user: context.user,
        attributes: context.payment_request_attributes,
        billing_address: billing_address,
        payables: payables
      )
    end

    def self.create_billing_address(attributes)
      Address.create!(
        country_id: attributes.dig(:billing_address, :country_id),
        state_id: attributes.dig(:billing_address, :state_id),
        address_street: attributes.dig(:billing_address, :line_1),
        address_number: attributes.dig(:billing_address, :number),
        address_complement:	attributes.dig(:billing_address, :line_2),
        address_neighbourhood: attributes.dig(:billing_address, :neighborhood),
        address_city: attributes.dig(:billing_address, :city),
        address_zip_code: attributes.dig(:billing_address, :zip_code),
        phone_number: attributes.dig(:billing_address, :phone_number),
        address_state: attributes.dig(:billing_address, :state)
      )
    end

    def self.find_payables(attributes)
      attributes[:items].map do |item_attributes|
        item_attributes[:payable_type].constantize.find(item_attributes[:payable_id])
      end
    end

    def self.create_payment_request(user:, attributes:, billing_address:, payables:)
      payment_request_attributes = card_identifier(attributes).merge({
        user_id: user.id,
        billing_address_id: billing_address.id,
        payment_method: attributes[:payment_method],
        installments_count: attributes[:installments_count],
        total_amount: payables.sum { |payable| payable.value }
      })

      payment_request = Billing::PaymentRequest.create!(payment_request_attributes)
      create_payment_request_items(payment_request: payment_request, payables: payables)
      payment_request
    end

    def self.card_identifier(attributes)
      if attributes[:gateway_card_id].present?
        { gateway_card_id: attributes[:gateway_card_id] }
      else
        { gateway_card_hash: attributes[:gateway_card_hash] }
      end
    end

    def self.create_payment_request_items(payment_request:, payables:)
      payables.each { |payable| payment_request.items.create!(payable: payable, amount: payable.value) }
    rescue ActiveRecord::RecordInvalid => e
      payment_request.destroy!
      payment_request.billing_address.destroy!

      raise e
    end
  end
end
