import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

test('client.transaction.capture', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transactions.capture({ id: 1234, amount: 1243 }),
    method: 'POST',
    url: '/transactions/1234/capture',
    body: {
      api_key: 'abc123',
      amount: 1243,
    },
  })
)

test('client.transactions.cardHashKey', () =>
  runTest({
    connect: {
      encryption_key: 'abc123',
    },
    subject: client => client.transactions.cardHashKey(),
    method: 'GET',
    url: '/transactions/card_hash_key',
    body: {
      encryption_key: 'abc123',
    },
  })
)

test('client.transactions.collectPayment', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transactions.collectPayment({
      id: 1234,
      email: 'a@b.com',
    }),
    method: 'POST',
    url: '/transactions/1234/collect_payment',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.transactions.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transactions.create({ amount: 1000 }),
    method: 'POST',
    url: '/transactions',
    body: {
      api_key: 'abc123',
      amount: 1000,
    },
  })
)

const findOptions = {
  connect: {
    api_key: 'abc123',
  },
  method: 'GET',
  body: {
    api_key: 'abc123',
  },
}

test('client.transactions.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.transactions.find({ id: 1337 }),
    url: '/transactions/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.transactions.find({ count: 10, page: 2 }),
    url: '/transactions',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.transactions.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.transactions.all({ count: 10, page: 2 }),
    url: '/transactions',
  }))
)

test('client.transactions.refund', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transactions.refund({ id: 1234, amount: 123 }),
    method: 'POST',
    url: '/transactions/1234/refund',
    body: {
      api_key: 'abc123',
      amount: 123,
    },
  })
)

test('client.transactions.update', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transactions.update({ id: 1234, status: 'paid' }),
    method: 'PUT',
    url: '/transactions/1234',
    body: {
      api_key: 'abc123',
      status: 'paid',
    },
  })
)

test('client.transactions.calculateInstallmentsAmount', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transactions.calculateInstallmentsAmount({
      max_installments: 3,
      free_installments: 2,
      interest_rate: 13,
      amount: 1000,
    }),
    method: 'GET',
    url: '/transactions/calculate_installments_amount',
    body: {
      api_key: 'abc123',
    },
  })
)
