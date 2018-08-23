import runTest from '../../test/runTest'

test('client.search', () =>
  runTest({
    connect: {
      api_key: 'abc123',
    },
    subject: client => client.search({
      query: {
        filtered: {},
      },
    }),
    method: 'GET',
    url: '/search',
    body: {
      api_key: 'abc123',
    },
  })
)
