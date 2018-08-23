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

test('client.plans.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.plans.find({ id: 1337 }),
    url: '/plans/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.plans.find({ count: 10, page: 2 }),
    url: '/plans',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.plans.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.plans.all({ count: 10, page: 2 }),
    url: '/plans',
  }))
)

test('client.plans.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.plans.create({
      amount: 1000,
      days: 2,
      name: 'Plano ouro',
      payments_methods: ['boleto'],
    }),
    method: 'POST',
    url: '/plans',
    body: {
      api_key: 'abc123',
      amount: 1000,
      days: 2,
      name: 'Plano ouro',
      payments_methods: ['boleto'],
    },
  })
)

test('client.plans.update', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client =>
      client.plans.update({ id: 1234, name: 'Plano ouro' }),
    method: 'PUT',
    url: '/plans/1234',
    body: {
      api_key: 'abc123',
      name: 'Plano ouro',
    },
  })
)
