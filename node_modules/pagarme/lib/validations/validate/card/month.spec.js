import month from './month'

describe('month validator', () => {
  it('should return true when a valid month is given', () => {
    expect(month(10)).toBe(true)
    expect(month('11')).toBe(true)
  })

  it('should return false when an invalid month is given', () => {
    expect(month(0)).toBe(false)
    expect(month('13')).toBe(false)
  })
})
