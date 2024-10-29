'use strict';

const { limitStringSize } = require('./limit_string_size')

/*
 * buildTransactionData(context)
 * build a object with transaction attributes
 * @param { Object } context - generated context from dal execution
 * @return { Object } - object with transaction attributes
 */
const buildTransactionData = (context) => {
  const payment = context.payment
  const isCreditCard = payment.data.payment_method === 'credit_card'
  const paymentData = isCreditCard ? cardTransactionData(context) : bankSlipTransactionData(context)
  const transactionMetadata = buildTransactionMetadata(context)
  
  let transactionData = {
    postback_url: process.env.POSTBACK_URL,
    async: false,
    payment_method: payment.data.payment_method,
    amount: payment.data.amount,
    ...paymentData,
    ...transactionMetadata
  }

  // Add recurrence_model only for credit card transactions
  if (isCreditCard) {
    transactionData.recurrence_model = 'standing_order'
  }

  return transactionData
}

/*
 * cardTransactionData(context)
 * build a object with credit card transaction attributes
 * @param { Object } context - generated context from dal execution
 * @return { Object } - object with credit card transaction attributes
 */
const cardTransactionData = (context) => {
  const payment = context.payment
  const transactionDescription = (context.project.permalink || '').substring(0, 13)
  const cardHash = { card_hash: payment.data.card_hash }
  const cardId = { card_id: context.payment_card && context.payment_card.gateway_data.id }
  const cardIdentifier = payment.data.card_hash ? cardHash : cardId

  return {
    capture: false,
    soft_descriptor: transactionDescription,
    ...cardIdentifier
  }
}

/*
 * bankSlipTransactionData(context)
 * build a object with bank slip transaction attributes
 * @param { Object } context - generated context from dal execution
 * @return { Object } - object with bank slip transaction attributes
 */
const bankSlipTransactionData = (context) => {
  const payment = context.payment
  const customer = payment.data.customer
  const isIndividual = customer.document_number.length === 11

  let address = {
    country: customer.address.country_code.toLowerCase(),
    state: customer.address.state.toLowerCase(),
    city: customer.address.city,
    street: customer.address.street,
    zipcode: customer.address.zipcode.replace(/\D/g, ""),
    neighborhood: customer.address.neighborhood,
    street_number: customer.address.street_number,
    complementary: customer.address.complementary
  }

  if(!customer.address.complementary) {
    delete address['complementary'];
  }

  return {
    customer: {
      external_id: `${customer.document_number}`,
      email: customer.email,
      name: limitStringSize(customer.name, 100),
      type: isIndividual ? 'individual' : 'corporation',
      country: address.country,
      documents: [{
        type: isIndividual ? 'cpf' : 'cnpj',
        number: customer.document_number
      }],
      phone_numbers: [
        '+55085999999999'
      ]
    },
    billing: {
      name: customer.name,
      address: address
    }
  }
}

/*
 * buildTransactionMetadata(context)
 * build a object with metadata transaction attributes
 * @param { Object } context - generated context from dal execution
 * @return { Object } - object with metadata transaction attributes
 */
const buildTransactionMetadata = ({ payment, user, project }) => {
  return {
    metadata: {
      payment_id: payment.id,
      project_id: payment.project_id,
      project_name: project.name,
      permalink: project.permalink,
      platform_id: payment.platform_id,
      subscription_id: payment.subscription_id,
      common_user_id: payment.user_id,
      user_id: user.external_id,
      user_name: user.data.name,
      user_email: user.email,
      cataloged_at: payment.created_at
    }
  }
}

module.exports = {
  buildTransactionData
}
