import date from './date'

describe('date validator', () => {
  it('should return true when a valid date is given', () => {
    expect(date('01/21')).toBe(true)
    expect(date('11/23')).toBe(true)
    expect(date('12/18')).toBe(true)
    expect(date('01/30')).toBe(true)
    expect(date('0121')).toBe(true)
    expect(date(1121)).toBe(true)
  })

  it('should return false when an invalid date is given', () => {
    expect(date('02/2015')).toBe(false)
    expect(date('02/2017')).toBe(false)
    expect(date('13/18')).toBe(false)
    expect(date('01/ab')).toBe(false)
  })
})
