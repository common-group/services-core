import {
  anyPass,
  equals,
  length,
  pipe,
  replace,
  toString,
} from 'ramda'

const clean = replace(/[^0-9]/g, '')

const lengthIs = number => pipe(
  length,
  equals(number)
)

const validate = anyPass([lengthIs(2), lengthIs(4)])

export default pipe(
  toString,
  clean,
  validate
)
