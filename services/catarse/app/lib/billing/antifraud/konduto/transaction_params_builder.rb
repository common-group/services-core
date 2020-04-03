module Billing
  module Antifraud
    module Konduto
      class TransactionParamsBuilder
        attr_reader :customer, :payment_request, :credit_card, :billing_address, :items

        def initialize(payment_request)
          @payment_request = payment_request
          @customer = payment_request.user
          @credit_card = payment_request.credit_card
          @billing_address = payment_request.billing_address
          @items = payment_request.items
        end

        def build
          {
            id: payment_request.id,
            ip: customer.current_sign_in_ip,
            total_amount: payment_request.total_amount.to_f,
            analyze: payment_request.authorized?,
            purchased_at: payment_request.created_at.utc.iso8601,
            customer: customer_params,
            payment: payment_params,
            billing: billing_params,
            shipping: billing_params,
            shopping_cart: shopping_cart_params
          }
        end

        private

        def customer_params
          {
            id: customer.id.to_s,
            name: customer.name[0..99],
            email: customer.email[0..99],
            dob: customer.birth_date.try(:iso8601),
            phone1: customer.phone_number,
            created_at: customer.created_at.to_date.iso8601
          }
        end

        def payment_params
          [{
            type: 'credit',
            status: payment_request.authorized? ? 'approved' : 'declined',
            bin: credit_card.first_digits,
            last4: credit_card.last_digits,
            expiration_date: credit_card.expires_on.strftime('%m%Y')
          }]
        end

        def billing_params
          country_params = billing_address.country.code.present? ? { country: billing_address.country.code } : {}
          country_params.merge(
            name: credit_card.holder_name,
            address1: billing_address.address_street,
            address2: billing_address.address_complement,
            city: billing_address.address_city,
            state: billing_address.address_state || billing_address.state.name,
            zip: billing_address.address_zip_code,
          )
        end

        def shopping_cart_params
          items.map do |item|
            reward = item.payable.reward
            project = item.payable.project

            item_params = if reward.present?
              { sku: reward.id.to_s, product_code: reward.id.to_s, created_at: reward.created_at.to_date.iso8601 }
            else
              { sku: project.id.to_s, product_code: project.id.to_s, created_at: project.created_at.to_date.iso8601 }
            end

            item_params.merge(
              category: 9999,
              name: "#{item.amount.to_s} - #{project.name}",
              unit_cost: item.amount.to_f,
              quantity: 1
            )
          end
        end
      end
    end
  end
end
