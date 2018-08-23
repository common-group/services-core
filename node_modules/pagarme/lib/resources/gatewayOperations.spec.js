import { merge } from 'ramda'
import Promise from 'bluebird'
import runTest from '../../test/runTest'

test('client.gatewayOperations.find', () => {
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
    subject: client => client.gatewayOperations.find({ transactionId: 1234 }),
    url: '/transactions/1234/gateway_operations',
  }))

  const findInSubscription = runTest(merge(options, {
    subject: client => client.gatewayOperations.find({ subscriptionId: 1234 }),
    url: '/subscriptions/1234/gateway_operations',
  }))

  const findOne = runTest(merge(options, {
    subject: client => client.gatewayOperations.find({ transactionId: 1234, id: 54321 }),
    url: '/transactions/1234/gateway_operations/54321',
  }))

  return Promise.props({
    findInTransaction,
    findInSubscription,
    findOne,
  })
})

test('client.gatewayOperations.refuseMessage', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.gatewayOperations.refuseMessage({ subscriptionId: 4321, id: 1234 }),
    url: '/subscriptions/4321/gateway_operations/1234/refuse_message',
    method: 'GET',
    body: {
      api_key: 'abc123',
    },
  })
)
