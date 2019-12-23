'use strict';

const { getCode } = require('country-list')

/*
 * buildAntifraudData(context, options)
 * build a object with antifraud data
 * @param { Object } context - generated context from dal execution
 * @param { Object } options - options for data build
 * @return { Object } - object with built antifraud data
 */
const buildAntifraudData = (context, options) => {
  const payment = context.payment
  const user = context.user
  const project = context.project
  const subscription = context.subscription
  const projectOwner = context.project_owner
  const creditCard = context.payment_card

  const customerData = buildCustomer(payment, user)
  const paymentData = buildPayment(creditCard, options.shouldAnalyze)
  const billingData = buildBilling(payment.data.customer)
  const shoppingCartData = buildShoppingCart(payment, project, subscription)
  const sellerData = buildSeller(projectOwner)

  return {
    id: options.transaction.id,
    visitor: payment.user_id,
    total_amount: payment.data.amount / 100,
    currency: 'BRL',
    installments: 1,
    ip: payment.data.current_ip,
    purchased_at: stringDateToISO8601(payment.created_at),
    analyze: options.shouldAnalyze,
    ...customerData,
    ...paymentData,
    ...billingData,
    ...shoppingCartData,
    ...sellerData
  }
}

/*
 * buildCustomer(payment, user)
 * build a object with customer data
 * @param { Object } payment - payment data
 * @param { Object } user - user data
 * @return { Object } - object with customer data
 */
const buildCustomer = (payment, user) => {
  const customer = payment.data.customer

  return {
    customer: {
      id: payment.user_id,
      name: customer.name,
      tax_id: payment.data.credit_card_owner_document || customer.document_number,
      phone1: buildPhoneNumber(customer.phone),
      email: customer.email,
      created_at: user.created_at.substr(0, 10),
    }
  }
}

/*
 * buildPayment(creditCard, isApproved)
 * build a object with payment data
 * @param { Object } creditCard - credit card data
 * @param { Boolean } isApproved - payment is approved or no
 * @return { Object } - object with payment data
 */
const buildPayment = (creditCard, isApproved) => {
  return {
    payment: [{
      type: 'credit',
      bin: creditCard.gateway_data.first_digits,
      last4: creditCard.gateway_data.last_digits,
      expiration_date: buildExpirationDate(creditCard.gateway_data.expiration_date),
      status: isApproved ? 'approved' : 'declined'
    }]
  }
}

/*
 * buildBilling(customer)
 * build a object with billing data
 * @param { Object } customer - Customer data
 * @return { Object } - object with billing data
 */
const buildBilling = (customer) => {
  const address = customer.address

  return {
    billing: {
      name: customer.name,
      address1: address.street,
      address2: address.complementary,
      city: address.city,
      state: address.state,
      zip: address.zipcode,
      country: getCode(address.country_en)
    }
  }
}

/*
 * buildShoppingCart(payment, project, subscription)
 * build a object with shopping cart data
 * @param { Object } payment - Payment data
 * @param { Object } project - Project data
 * @param { Object } subscription - Subscription data
 * @return { Object } - object with shopping cart data
 */
const buildShoppingCart = (payment, project, subscription) => {
  const productName = `${payment.data.amount / 100.0} - ${project.data.name}`

  return {
    shopping_cart: [{
      product_code: subscription.reward_id,
      category: 9999,
      name: productName,
      unit_cost: payment.data.amount / 100.0,
      quantity: 1,
      created_at: subscription.created_at.substr(0, 10)
    }]
  }
}

/*
 * buildSeller(projectOwner)
 * build a object with seller data
 * @param { Object } projectOwner - Project owner data
 * @return { Object } - object with seller data
 */
const buildSeller = (projectOwner) => {
  return {
    seller: {
      id: projectOwner.id,
      name: projectOwner.data.name,
      created_at: projectOwner.created_at.substr(0, 10)
    }
  }
}

/*
 * stringDateToISO8601(string)
 * Convert string date to ISO 8601 format
 * @param { String } string - String date
 * @return { String } - date formatted with ISO 8601
 */
const stringDateToISO8601 = (string) => {
  return `${string.substring(0, 19)}Z`
}

/*
 * buildPhoneNumber(phone)
 * Convert phone object to string
 * @param { Object } phone - Phone date
 * @return { String } - phone as string
 */
const buildPhoneNumber = (phone) => {
  return [phone.ddi, phone.ddd, phone.number].join('')
}

/*
 * buildExpirationDate(experitaionDate)
 * Convert expiration date from 4 digits to 6 digits
 * @param { String } expirationDate - expiration date
 * @return { String } - expiration date with 6 digits
 */
const buildExpirationDate = (expirationDate) => {
  return expirationDate.slice(0, 2) + '20' + expirationDate.slice(2, 4)
}

module.exports = {
  buildAntifraudData
}
