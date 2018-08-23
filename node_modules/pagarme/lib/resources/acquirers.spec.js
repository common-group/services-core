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

test('client.acquirers.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.acquirers.find({ id: 1337 }),
    url: '/acquirer/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.acquirers.find({ count: 10, page: 2 }),
    url: '/acquirers',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.acquirers.all', () => {
  return runTest(merge(findOptions, {
    subject: client => client.acquirers.all({ count: 10, page: 2 }),
    url: '/acquirers',
  }))
})

test('client.acquirers.create', () => {
  return runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.acquirers.create({
      company: 'Felquis Corp',
    }),
    method: 'POST',
    url: '/acquirers',
    body: {
      api_key: 'abc123',
      company: 'Felquis Corp',
    },
  })
})

test('client.acquirers.update', () => {
  return runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.acquirers.update({ id: 1234, company: 'Felquis Corp', }),
    method: 'PUT',
    url: '/acquirer/1234',
    body: {
      api_key: 'abc123',
      company: 'Felquis Corp',
    }
  })
})
