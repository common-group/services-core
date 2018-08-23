import { cnpj, cpf } from './cnpjAndCpf'

describe('CNPJ and CPF validator', () => {
  it('should return true when a valid cnpj is given', () => {
    expect(cnpj('18.727.053/0001-74')).toBe(true)
    expect(cnpj('18727.053/0001-74')).toBe(true)
    expect(cnpj('18727.0530001-74')).toBe(true)
    expect(cnpj('18727053/0001-74')).toBe(true)
    expect(cnpj('18727053/000174')).toBe(true)
    expect(cnpj('187270530001-74')).toBe(true)
    expect(cnpj(18727053000174)).toBe(true)
  })

  it('should return false when an invalid cnpj is given', () => {
    expect(cnpj('17.727.053/0001-74')).toBe(false)
    expect(cnpj('17727.053/0001-74')).toBe(false)
    expect(cnpj('17727.0530001-74')).toBe(false)
    expect(cnpj('17727053/0001-74')).toBe(false)
    expect(cnpj('17727053/000174')).toBe(false)
    expect(cnpj('177270530001-74')).toBe(false)
    expect(cnpj(17727053000174)).toBe(false)
  })

  it('should return true when a valid cpf is given', () => {
    expect(cpf('408.855.998-37')).toBe(true)
  })

  it('should return false when an invalid cpf is given', () => {
    expect(cpf('407.855.998-37')).toBe(false)
  })
})
