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

test('client.bankAccounts.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.bankAccounts.find({ id: 1337 }),
    url: '/bank_accounts/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.bankAccounts.find({ count: 10, page: 2 }),
    url: '/bank_accounts',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.bankAccounts.all', () => {
  return runTest(merge(findOptions, {
    subject: client => client.bankAccounts.all({ count: 10, page: 2 }),
    url: '/bank_accounts',
  }))
})

test('client.bankAccounts.create', () => {
  return runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.bankAccounts.create({
      bank_code: 341,
      agencia: 9325,
    }),
    method: 'POST',
    url: '/bank_accounts',
    body: {
      api_key: 'abc123',
      bank_code: 341,
      agencia: 9325,
    },
  })
})
