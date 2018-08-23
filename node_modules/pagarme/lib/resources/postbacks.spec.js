import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

test('client.postbacks.find', () => {
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
    subject: client => client.postbacks.find({ transactionId: 1234 }),
    url: '/transactions/1234/postbacks',
  }))

  const findInSubscription = runTest(merge(options, {
    subject: client => client.postbacks.find({ subscriptionId: 1234 }),
    url: '/subscriptions/1234/postbacks',
  }))

  const findOne = runTest(merge(options, {
    subject: client => client.postbacks.find({ transactionId: 1234, id: 54321 }),
    url: '/transactions/1234/postbacks/54321',
  }))

  return Promise.props({
    findInTransaction,
    findInSubscription,
    findOne,
  })
})

test('client.postbacks.redeliver', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.postbacks.redeliver({ subscriptionId: 4321, id: 1234 }),
    url: '/subscriptions/4321/postbacks/1234/redeliver',
    method: 'POST',
    body: {
      api_key: 'abc123',
    },
  })
)
