import postback from './index'

describe('postback validation', () => {
  test('postback.calculateSignature', () => {
    const result = postback.calculateSignature('key', 'body')

    expect(result)
      .toBe('70bbf6819d1037aa94ca7e7f537cbea25fe49283')
  })
  test('postback.verifySignature', () => {
    const verify = string =>
      postback.verifySignature('key', 'body', string)

    expect(verify('70bbf6819d1037aa94ca7e7f537cbea25fe49283'))
      .toBe(true)

    expect(verify('invalid'))
      .toBe(false)
  })
})
