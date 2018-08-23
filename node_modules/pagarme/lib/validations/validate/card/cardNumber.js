import {
  F,
  T,
  __,
  add,
  and,
  cond,
  dropLast,
  equals,
  last,
  length,
  modulo,
  not,
  pipe,
  reduce,
  replace,
  subtract,
  toString,
} from 'ramda'

const clean = replace(/[^0-9]/g, '')

const isEven = pipe(
  modulo(__, 2),
  equals(0)
)

const isOdd = pipe(
  isEven,
  not
)

const hasEvenDigitsLenghtAndEvenIndex = (digitsMod, indexMod) =>
  and(isEven(digitsMod), isEven(indexMod))

const hasOddDigitsLenghtAndOddIndex = (digitsMod, indexMod) =>
  and(isOdd(digitsMod), isOdd(indexMod))

const mask = [0, 1, 2, 3, 4, -4, -3, -2, -1, 0]

const reduFinalSum = withoutLastDigit => (acc, digit, index, digits) => {
  const digitsMod = modulo(length(digits) - 1, 2)
  const indexMod = modulo(index, 2)

  const shouldUseIndex = cond([
    [hasEvenDigitsLenghtAndEvenIndex, T],
    [hasOddDigitsLenghtAndOddIndex, T],
    [T, F],
  ])(digitsMod, indexMod)

  if (not(shouldUseIndex)) {
    return acc
  }

  const maskIndex = withoutLastDigit[index]

  return acc + mask[maskIndex]
}

const validate = (cardNumber) => {
  const lastDigit = last(cardNumber)
  const withoutLastDigit = dropLast(1, cardNumber)
  const sumDigits = reduce(add, 0, withoutLastDigit)
  const digitsArray = withoutLastDigit.split('')
  const finalSum = digitsArray.reduceRight(reduFinalSum(withoutLastDigit), sumDigits)

  const toSubtract = modulo(finalSum, 10)

  let mod10 = subtract(10, toSubtract)

  if (mod10 === 10) {
    mod10 = 0
  }

  return (mod10 === Number(lastDigit))
}

export default pipe(
  toString,
  clean,
  validate
)

