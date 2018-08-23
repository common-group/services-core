import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

test('client.events.find', () => {
  const options = {
    connect: {
      api_key: 'abc123',
    },
    method: 'GET',
    body: {
      api_key: 'abc123',
    },
  }

  const findInTransaction = runTest(merge(options, {
    subject: client => client.events.find({ transactionId: 1234 }),
    url: '/transactions/1234/events',
  }))

  const findInSubscription = runTest(merge(options, {
    subject: client => client.events.find({ subscriptionId: 1234 }),
    url: '/subscriptions/1234/events',
  }))

  const findOne = runTest(merge(options, {
    subject: client => client.events.find({ transactionId: 1234, id: 54321 }),
    url: '/transactions/1234/events/54321',
  }))

  return Promise.props({
    findInTransaction,
    findInSubscription,
    findOne,
  })
})

test('client.events.findCustom', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.events.findCustom({ model_id: 'transactions' }),
    method: 'GET',
    url: '/events',
    body: {
      api_key: 'abc123',
      model_id: 'transactions',
    },
  })
)
