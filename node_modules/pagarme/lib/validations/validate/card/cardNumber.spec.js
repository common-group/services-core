import cardNumber from './cardNumber'

describe('Card number validator', () => {
  it('should return true when a valid card number is given', () => {
    expect(cardNumber('4111111111111111')).toBe(true)
    expect(cardNumber('343467796144134')).toBe(true)

    expect(cardNumber(4111111111111111)).toBe(true)
    expect(cardNumber(343467796144134)).toBe(true)
  })

  it('should return false when an invalid card number is given', () => {
    expect(cardNumber('411111111111')).toBe(false)
    expect(cardNumber('3434676144134')).toBe(false)

    expect(cardNumber(123456789523)).toBe(false)
    expect(cardNumber(2563452514251251)).toBe(false)
  })
})
