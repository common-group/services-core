import {
  __,
  ap,
  apply,
  applySpec,
  has,
  not,
  omit,
  pipe,
  prop,
} from 'ramda'

import brand from './brand'
import cvv from './cvv'
import cardNumber from './cardNumber'
import date from './date'
import holder from './holder'

const validProps = [
  'card_holder_name',
  'card_number',
  'card_expiration_date',
  'card_cvv',
]

const missingProps = (card) => {
  const missing = pipe(has(__, card), not)
  return validProps.filter(missing)
}

const hasCardNumber = has('card_number')

const validDate = pipe(
  prop('card_expiration_date'),
  date
)

const validHolder = pipe(
  prop('card_holder_name'),
  holder
)

const validCardNumber = pipe(
  prop('card_number'),
  cardNumber
)

const validCvv = brandName => pipe(
  prop('card_cvv'),
  cvv(brandName)
)

const getBrand = pipe(
  prop('card_number'),
  brand
)

const validateAll = card => applySpec({
  brand: getBrand,
  card_holder_name: validHolder,
  card_number: validCardNumber,
  card_expiration_date: validDate,
  card_cvv: validCvv(getBrand(card)),
})(card)

const validateExistentProps = card =>
  apply(omit, ap([missingProps, validateAll], [card]))

const validate = (card) => {
  if (hasCardNumber(card)) {
    return validateExistentProps(card)
  }
  throw new Error('Missing card number')
}

export default validate
