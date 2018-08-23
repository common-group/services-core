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

test('client.cards.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.cards.find({ id: 1337 }),
    url: '/cards/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.cards.find({ count: 10, page: 2 }),
    url: '/cards',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.cards.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.cards.all({ count: 10, page: 2 }),
    url: '/cards',
  }))
)

test('client.cards.create', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.cards.create({
      holder_name: 'API Customer',
    }),
    method: 'POST',
    url: '/cards',
    body: {
      api_key: 'abc123',
      holder_name: 'API Customer',
    },
  })
)


