import {
  always,
  equals,
  ifElse,
  length,
  pipe,
  replace,
  toString,
} from 'ramda'

const clean = replace(/[^0-9]/g, '')

const isAmex = equals('amex')

const lengthEquals = size => pipe(
  length,
  equals(size)
)

const validateFrom = brand =>
  ifElse(
    always(isAmex(brand)),
    lengthEquals(4),
    lengthEquals(3)
  )

const validate = brand => pipe(
  toString,
  clean,
  validateFrom(brand)
)

export default validate
