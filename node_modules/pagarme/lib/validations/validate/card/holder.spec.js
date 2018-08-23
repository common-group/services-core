import holder from './holder'

describe('holder validator', () => {
  it('should return true when a valid name is given', () => {
    expect(holder('Leonardo')).toBe(true)
    expect(holder('Marco Worms')).toBe(true)
  })

  it('should return false when an invalid name is given', () => {
    expect(holder('623292')).toBe(false)
    expect(holder('W0rms')).toBe(false)
    expect(holder('Marco W0rms')).toBe(false)
  })
})
