'use strict';

const test = require('ava');
const nock = require('nock');
const { createOrder } = require('../../lib/konduto_client');

test('test createOrder', async t => {
  const antifraudData = { example: 'here' }
  const responseMock = { reponse: 'here' }
  process.env.ANTIFRAUD_API_KEY = 'some-key'

  const scope = nock('https://api.konduto.com', {
    reqheaders: { 'Authorization': `Basic ${Buffer.from('some-key').toString('base64')}`}
  }).post('/v1/orders', antifraudData).reply(201, responseMock)

  const response = await createOrder(antifraudData)

  t.true(scope.isDone())
  t.deepEqual(response.data, responseMock)
});
