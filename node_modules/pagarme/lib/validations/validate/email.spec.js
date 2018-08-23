import email from './email'

describe('Email validator', () => {
  it('should return true when a valid email is given', () => {
    expect(email('a@b.com')).toBe(true)
  })

  it('should return false when an invalid email is given', () => {
    expect(email('ab.com')).toBe(false)
    expect(email('a@b')).toBe(false)
  })
})
