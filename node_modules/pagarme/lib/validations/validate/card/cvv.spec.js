import cvv from './cvv'

describe('cvv validator', () => {
  it("should validate amex's cvv", () => {
    expect(cvv('amex')('5535')).toBe(true)
    expect(cvv('amex')('526')).toBe(false)
    expect(cvv('amex')(5535)).toBe(true)
    expect(cvv('amex')(526)).toBe(false)
  })

  it('should validate other cards', () => {
    expect(cvv('visa')('852')).toBe(true)
    expect(cvv('visa')('8528')).toBe(false)
    expect(cvv('visa')(852)).toBe(true)
    expect(cvv('visa')(8528)).toBe(false)
  })
})
