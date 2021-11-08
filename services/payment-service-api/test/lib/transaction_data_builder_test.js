'use strict';

const test = require('ava');
const R = require('ramda');
const { buildTransactionData } = require('../../lib/transaction_data_builder');

// generate card reply
const sampleContext = (overwrite = {}) => {
  let context = {
    payment: {
      id: 'some-id-here',
      project_id: 'project-id-here',
      platform_id: 'platform-id-here',
      subscription_id: 'subscription-id-here',
      user_id: 'user-id-here',
      created_at: '2019-02-01 12:30:20',
      data: {
        payment_method: '',
        amount: 123.45
      }
    },
    payment_card: {
      gateway_data: {}
    },
    project: {
      name: 'Projeto Novo',
      permalink: 'projetonovo'
    },
    user: {
      external_id: '2355',
      email: 'josedasilva@email.com',
      data: {
        name: 'José da Silva'
      }
    }
  }

  return R.mergeDeepRight(context, overwrite);
};

const creditCardContextData = (overwrite = {}) => {
  let context = {
    payment: {
      data: {
        payment_method: 'credit_card'
      }
    },
    project: {
      permalink: 'project-name-here-very-long'
    }
  }

  return R.mergeDeepRight(context, overwrite)
}

const bankSlipContextData = (overwrite = {}) => {
  let context = {
    payment: {
      data: {
        payment_method: 'boleto',
        customer: {
          document_number: '12345678901',
          name: 'John Appleseed'
        }
      }
    }
  }

  return R.mergeDeepRight(context, overwrite)
}


process.env.POSTBACK_URL = 'postback.example.com'

test('test buildTransactionData - common data', async t => {
    const context = sampleContext(creditCardContextData())
    const transactionData = buildTransactionData(context)
    const expectedResponse = {
      postback_url: process.env.POSTBACK_URL,
      async: false,
      payment_method: context.payment.data.payment_method,
      amount: context.payment.data.amount,
      metadata: {
        payment_id: context.payment.id,
        project_id: context.payment.project_id,
        project_name: context.project.name,
        permalink: context.project.permalink,
        platform_id: context.payment.platform_id,
        subscription_id: context.payment.subscription_id,
        common_user_id: context.payment.user_id,
        user_id: context.user.external_id,
        user_name: context.user.data.name,
        user_email: context.user.email,
        cataloged_at: context.payment.created_at
      }
    }

    t.is(transactionData.postback_url, expectedResponse.postback_url)
    t.is(transactionData.async, expectedResponse.async)
    t.is(transactionData.payment_method, expectedResponse.payment_method)
    t.is(transactionData.amount, expectedResponse.amount)
    t.deepEqual(transactionData.metadata, expectedResponse.metadata)
});

test('test buildTransactionData - not saved credit card', async t => {
  const contextOvewrite = { payment: { data: { card_hash: 'card-hash-here' } } }
  const context = sampleContext(creditCardContextData(contextOvewrite))
  const transactionData = buildTransactionData(context)
  const expectedResponse = {
    capture: false,
    soft_descriptor: context.project.permalink.substring(0, 13),
    card_hash: context.payment.data.card_hash,
  }

  t.is(transactionData.capture, expectedResponse.capture)
  t.is(transactionData.soft_descriptor, expectedResponse.soft_descriptor)
  t.is(transactionData.card_hash, expectedResponse.card_hash)
})

test('test buildTransactionData - saved credit card', async t => {
  const contextOvewrite = { payment_card: { gateway_data: { id: 'card-id-here' } } }
  const context = sampleContext(creditCardContextData(contextOvewrite))
  const transactionData = buildTransactionData(context)
  const expectedResponse = {
    capture: false,
    soft_descriptor: context.project.permalink.substring(0, 13),
    card_id: context.payment_card.gateway_data.id
  }

  t.is(transactionData.capture, expectedResponse.capture)
  t.is(transactionData.soft_descriptor, expectedResponse.soft_descriptor)
  t.is(transactionData.card_id, expectedResponse.card_id)
})

test('test buildTransactionData - bank slip for individual person', async t => {
  const contextOvewrite = {  payment: { data: { customer: { document_number: '12345678901' } } } }
  const context = sampleContext(bankSlipContextData(contextOvewrite))
  const transactionData = buildTransactionData(context)
  const expectedResponse = {
    customer: {
      name: context.payment.data.customer.name,
      type: 'individual',
      documents: [{
        type: 'cpf',
        number: context.payment.data.customer.document_number
      }]
    }
  }

  t.is(transactionData.payment_method, 'boleto')
  t.deepEqual(transactionData.customer, expectedResponse.customer)
})

test('test buildTransactionData - bank slip for corporation', async t => {
  const contextOvewrite = {  payment: { data: { customer: { document_number: '12345678901234' } } } }
  const context = sampleContext(bankSlipContextData(contextOvewrite))
  const transactionData = buildTransactionData(context)
  const expectedResponse = {
    customer: {
      name: context.payment.data.customer.name,
      type: 'corporation',
      documents: [{
        type: 'cnpj',
        number: context.payment.data.customer.document_number
      }]
    }
  }

  t.is(transactionData.payment_method, 'boleto')
  t.deepEqual(transactionData.customer, expectedResponse.customer)
})
