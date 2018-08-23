import Promise from 'bluebird'
import { merge } from 'ramda'

import runTest from '../../test/runTest'

test('client.user.create', () =>
  runTest({
    connect: {
      api_key: 'foobar',
    },
    subject: client => client.user.create({
      email: 'foo@bar.com',
      password: 'ilovememes',
      invite_token: 'MZlHX645Z24gUgri6RpOuATe5CtalW',
      name: 'Josefim',
    }),
    method: 'POST',
    url: '/users',
    body: {
      api_key: 'foobar',
      email: 'foo@bar.com',
      password: 'ilovememes',
      invite_token: 'MZlHX645Z24gUgri6RpOuATe5CtalW',
      name: 'Josefim',
    },
  })
)

test('client.user.redefinePassword', () =>
  runTest({
    connect: {
      api_key: 'foobar',
    },
    subject: client => client.user.redefinePassword({
      password: 'ilovememes',
      token: 'MZlHX645Z24gUgri6RpOuATe5CtalW',
    }),
    method: 'PUT',
    url: '/users/redefine_password',
    body: {
      api_key: 'foobar',
      password: 'ilovememes',
      token: 'MZlHX645Z24gUgri6RpOuATe5CtalW',
    },
  })
)

test('client.user.resetPassword', () =>
  runTest({
    connect: {
      api_key: 'foobar',
    },
    subject: client => client.user.resetPassword({
      email: 'foo@bar.com',
    }),
    method: 'PUT',
    url: '/users/reset_password',
    body: {},
  })
)

const findOptions = {
  connect: {
    api_key: 'abc123',
  },
  method: 'GET',
  body: {
    api_key: 'abc123',
  },
}

test('client.user.find', () => {
  const find = runTest(merge(findOptions, {
    subject: client => client.user.find({ id: 42 }),
    url: '/users/42',
  }))

  const findAll = runTest(merge(findOptions, {
    subject: client => client.user.find({ count: 10, page: 2 }),
    url: '/users',
  }))

  return Promise.props({
    find,
    findAll,
  })
})

test('client.user.all', () =>
  runTest(merge(findOptions, {
    subject: client => client.user.all({ count: 10, page: 2 }),
    url: '/users',
  }))
)


test('client.user.destroy', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.user.destroy({
      id: 1234,
    }),
    method: 'DELETE',
    url: '/users/1234',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.user.update', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.user.update({ id: 42, permission: 'read_write' }),
    method: 'PUT',
    url: '/users/42',
    body: {
      api_key: 'abc123',
      permission: 'read_write',
    },
  })
)

test('client.user.updatePassword', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.user.update({ id: 42, current_password: 'foo', new_password: 'bar' }),
    method: 'PUT',
    url: '/users/42',
    body: {
      api_key: 'abc123',
      current_password: 'foo',
      new_password: 'bar',
    },
  })
)

test('client.transactions.current', () =>
  runTest(merge(findOptions, {
    subject: client => client.user.current(),
    url: '/user',
    method: 'GET',
  }))
)

