import {
  __,
  both,
  gte,
  lte,
  pipe,
} from 'ramda'

const validate = both(gte(__, 1), lte(__, 12))

export default pipe(
  parseInt,
  validate
)
