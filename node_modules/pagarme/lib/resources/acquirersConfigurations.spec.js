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

test('client.acquirersConfigurations.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.acquirersConfigurations.find({ id: 1337 }),
    url: '/acquirers_configuration/1337',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.acquirersConfigurations.find({ count: 10, page: 2 }),
    url: '/acquirers_configurations',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.acquirersConfigurations.all', () => {
  return runTest(merge(findOptions, {
    subject: client => client.acquirersConfigurations.all({ count: 10, page: 2 }),
    url: '/acquirers_configurations',
  }))
})

test('client.acquirersConfigurations.create', () => {
  return runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.acquirersConfigurations.create({
      company: 'Felquis Corp',
    }),
    method: 'POST',
    url: '/acquirers_configurations',
    body: {
      api_key: 'abc123',
      company: 'Felquis Corp',
    },
  })
})

test('client.acquirersConfigurations.update', () => {
  return runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.acquirersConfigurations.update({ id: 1234, company: 'Felquis Corp', }),
    method: 'PUT',
    url: '/acquirers_configuration/1234',
    body: {
      api_key: 'abc123',
      company: 'Felquis Corp',
    }
  })
})
