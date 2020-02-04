module Billing
  class CreatePaymentRequestAction
    extend LightService::Action

    expects :payment_request_attributes

    promises :payment_request

    executed do |context|
      billing_address = create_billing_address(context)
      payment_request_items = build_payment_request_items(context)
      context.payment_request = create_payment_request(
        context: context,
        billing_address: billing_address,
        payment_request_items: payment_request_items
      )
    end

    private_class_method def self.create_billing_address(context)
      address_attributes = context.payment_request_attributes[:billing_address]
      address = Address.new(
        country_id: address_attributes[:country_id],
        state_id: address_attributes[:state_id],
        address_street: address_attributes[:line_1],
        address_number: address_attributes[:number],
        address_complement:	address_attributes[:line_2],
        address_neighbourhood: address_attributes[:neighborhood],
        address_city: address_attributes[:city],
        address_zip_code: address_attributes[:zip_code],
        phone_number: address_attributes[:phone_number],
        address_state: address_attributes[:state],
      )
      context.fail_and_return!('Address is invalid') unless address.save
      address
    end

    private_class_method def self.build_payment_request_items(context)
      context.payment_request_attributes[:items].map do |item_attributes|
        item = Billing::PaymentRequestItem.new(payable_type: item_attributes[:payable_type], payable_id: item_attributes[:payable_id])
        item.amount = item.payable.value
        item
      end
    end

    private_class_method def self.create_payment_request(context:, billing_address:, payment_request_items:)
      payment_request_attributes = build_card_identifier.merge({
        billing_address: billing_address
        payment_method: context.payment_request_attributes[:payment_method],
        installments_count: context.payment_request_attributes[:installments_count],
        total_amount: payment_request_items.sum { |item| item.payable.value },
      })

      payment_request = Billing::PaymentRequest.create(payment_request_attributes)
      payment_request.items << payment_request_items
    end

    private_class_method def self.build_card_identifier(payment_request_attributes)
      if payment_request_attributes[:gateway_card_id].present?
        { card_id: payment_request_attributes[:gateway_card_id] }
      else
        { card_hash: payment_request_attributes[:gateway_card_hash] }
      end
    end
  end
end
