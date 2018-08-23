import runTest from '../../test/runTest'

test('client.splitRules.find', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.splitRules.find({
      transactionId: 1234,
    }),
    method: 'GET',
    url: '/transactions/1234/split_rules',
    body: {
      api_key: 'abc123',
    },
  })
)

test('client.splitRules.find', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.splitRules.find({
      transactionId: 1234,
      id: 5432,
    }),
    method: 'GET',
    url: '/transactions/1234/split_rules/5432',
    body: {
      api_key: 'abc123',
    },
  })
)
