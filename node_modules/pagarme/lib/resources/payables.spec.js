import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

test('client.transactions.payables', () => {
  const options = {
    connect: {
      api_key: 'abc123',
    },
    method: 'GET',
    body: {
      api_key: 'abc123',
    },
  }

  const findAll = runTest(merge(options, {
    subject: client => client.payables.all(),
    url: '/payables',
  }))

  const findTransaction = runTest(merge(options, {
    subject: client => client.payables.find({ transactionId: 1234 }),
    url: '/transactions/1234/payables',
  }))

  const findOne = runTest(merge(options, {
    subject: client => client.payables.find({ id: 5432 }),
    url: '/payables/5432',
  }))

  return Promise.props({
    findAll,
    findTransaction,
    findOne,
  })
})
