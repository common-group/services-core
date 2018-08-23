import brand from './brand'

describe('getCardBrand validator', () => {
  it('should identify visa card numbers', () => {
    expect(brand('4111 1111 1111 1111')).toBe('visa')
  })

  it('should identify elo card numbers', () => {
    expect(brand('6363680000457013')).toBe('elo')
    expect(brand('4389350000457013')).toBe('elo')
    expect(brand('5041750000457013')).toBe('elo')
    expect(brand('4514160000457013')).toBe('elo')
    expect(brand('6362970000457013')).toBe('elo')
    expect(brand('506734882114864')).toBe('elo')
    expect(brand('509005334509218')).toBe('elo')
  })

  it('should identify discover card numbers', () => {
    expect(brand('6011020000245045')).toBe('discover')
    expect(brand('6221020000245045')).toBe('discover')
    expect(brand('6411020000245045')).toBe('discover')
    expect(brand('6511020000245045')).toBe('discover')
  })

  it('should identify diners card numbers', () => {
    expect(brand('30190102462661')).toBe('diners')
    expect(brand('30590102462661')).toBe('diners')
    expect(brand('36490102462661')).toBe('diners')
    expect(brand('38490102462661')).toBe('diners')
  })

  it('should identify amex card numbers', () => {
    expect(brand('348149451448134')).toBe('amex')
    expect(brand('372566898118716')).toBe('amex')
  })

  it('should identify aura card numbers', () => {
    expect(brand('508149451448134')).toBe('aura')
    expect(brand('5067970000457013')).toBe('aura')
  })

  it('should identify jcb card numbers', () => {
    expect(brand('3528256349013271')).toBe('jcb')
  })

  it('should identify hipercard card numbers', () => {
    expect(brand('6028256349013271')).toBe('hipercard')
  })

  it('should identify mastercard card numbers', () => {
    expect(brand('5488930079839278')).toBe('mastercard')
    expect(brand('5578006428616906')).toBe('mastercard')
    expect(brand('5111268739494928')).toBe('mastercard')
  })
})
