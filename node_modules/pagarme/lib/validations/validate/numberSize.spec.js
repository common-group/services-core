import {
  anyPass,
} from 'ramda'

import numberSize from './numberSize'

const ddd = numberSize(2)
const phone = anyPass([numberSize(8), numberSize(9)])
const zipcode = numberSize(8)

describe('DDD validator', () => {
  it('should return true when 2 numbers are given', () => {
    expect(ddd(14)).toBe(true)
    expect(ddd(214)).toBe(false)
    expect(ddd('153')).toBe(false)
    expect(ddd('15')).toBe(true)
    expect(ddd('a5')).toBe(false)
  })
})

describe('Phone number validator', () => {
  it('should return true when 8 or 9 numbers are given', () => {
    expect(phone(14123456)).toBe(true)
    expect(phone(141234562)).toBe(true)
    expect(phone(2141234455)).toBe(false)
    expect(phone('153adfg32')).toBe(false)
    expect(phone('15327543')).toBe(true)
    expect(phone('15327543s3')).toBe(true)
    expect(phone('a5321')).toBe(false)
  })
})

describe('Zipcode validator', () => {
  it('should return true when 8 numebrs are given', () => {
    expect(zipcode(14123456)).toBe(true)
    expect(zipcode(141234562)).toBe(false)
    expect(zipcode(2141234455)).toBe(false)
    expect(zipcode('153adfg32')).toBe(false)
    expect(zipcode('15327543')).toBe(true)
    expect(zipcode('15327543s3')).toBe(false)
    expect(zipcode('a5321')).toBe(false)
  })
})

