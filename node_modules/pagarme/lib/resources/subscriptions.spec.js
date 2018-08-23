import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

const findOptions = {
  connect: {
    api_key: 'abc123',
  },
  method: 'GET',
  body: {
    api_key: 'abc123',
  },
}

test('client.subscriptions.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.subscriptions.find({ id: 1337 }),
    url: '/subscriptions/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.subscriptions.find({ count: 10, page: 2 }),
    url: '/subscriptions',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.subscriptions.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.subscriptions.all({ count: 10, page: 2 }),
    url: '/subscriptions',
  }))
)

test('client.subscriptions.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.subscriptions.create({
      plan_id: 12345,
    }),
    method: 'POST',
    url: '/subscriptions',
    body: {
      api_key: 'abc123',
      plan_id: 12345,
    },
  })
)

test('client.subscriptions.update', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.subscriptions.update({ id: 1234, plan_id: 123456 }),
    method: 'PUT',
    url: '/subscriptions/1234',
    body: {
      api_key: 'abc123',
      plan_id: 123456,
    },
  })
)

test('client.subscriptions.cancel', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.subscriptions.cancel({ id: 1234 }),
    method: 'POST',
    url: '/subscriptions/1234/cancel',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.subscriptions.createTransaction', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.subscriptions.createTransaction({ id: 5686, amount: 1234 }),
    method: 'POST',
    url: '/subscriptions/5686/transactions',
    body: {
      api_key: 'abc123',
      amount: 1234,
    },
  })
)

test('client.subscriptions.findTransactions', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.subscriptions.findTransactions({ id: 5686 }),
    method: 'GET',
    url: '/subscriptions/5686/transactions',
    body: {
      api_key: 'abc123',
    },
  })
)
