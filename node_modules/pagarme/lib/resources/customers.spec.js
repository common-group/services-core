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

test('client.customers.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.customers.find({ id: 1337 }),
    url: '/customers/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.customers.find({ count: 2, page: 10 }),
    url: '/customers',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.customers.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.customers.all(),
    url: '/customers',
  }))
)

test('client.customers.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.customers.create({ name: 'Leonardo', gender: 'M' }),
    method: 'POST',
    url: '/customers',
    body: {
      api_key: 'abc123',
      name: 'Leonardo',
      gender: 'M',
    },
  })
)
