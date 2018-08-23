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

test('client.transfers.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.transfers.find({ id: 1337 }),
    url: '/transfers/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.transfers.find({ count: 10, page: 2 }),
    url: '/transfers',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.transfers.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.transfers.all({ count: 10, page: 2 }),
    url: '/transfers',
  }))
)

test('client.transfers.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transfers.create({
      amount: 12345,
    }),
    method: 'POST',
    url: '/transfers',
    body: {
      api_key: 'abc123',
      amount: 12345,
    },
  })
)

test('client.transfers.cancel', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transfers.cancel({ id: 1234 }),
    method: 'POST',
    url: '/transfers/1234/cancel',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.transfers.days', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transfers.days(),
    method: 'GET',
    url: '/transfers/days',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.transfers.limits', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.transfers.limits(),
    method: 'GET',
    url: '/transfers/limits',
    body: {
      api_key: 'abc123',
    },
  })
)
