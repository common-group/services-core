import year from './year'

describe('year validator', () => {
  it('should return true when a valid year is given', () => {
    expect(year(20)).toBe(true)
    expect(year('20')).toBe(true)
    expect(year(2020)).toBe(true)
    expect(year('2020')).toBe(true)
  })

  it('should return false when an invalid year is given', () => {
    expect(year('')).toBe(false)
    expect(year(2)).toBe(false)
    expect(year(201)).toBe(false)
    expect(year('23592')).toBe(false)
  })
})
