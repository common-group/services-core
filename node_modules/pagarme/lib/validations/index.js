/**
 * @name Validations
 * @description This module handles needed validations
 * @module validations
 **/

import {
  __,
  ifElse,
  keys,
  map,
  mapObjIndexed,
  pick,
  pipe,
  prop,
} from 'ramda'

import validations from './validate'

const pickExistentValidations = pipe(
  keys,
  pick
)

const validation = prop(__, validations)

const mapIfArray = func =>
  ifElse(Array.isArray, map(func), func)

const validateInput = (value, name) =>
  mapIfArray(validation(name))(value)


const applyValidations = mapObjIndexed(validateInput)

/**
 * This method validates the properties supplied in the object.
 *
 * @param {Object} [body] An object that contains all properties to
 *                        be validated.
 * @param {(String|String[]|Number|Number[])} [body.cnpj] A CNPF, or an array
 *                                                        of CNPFs, to be
 *                                                        validated.
 * @param {(String|String[]|Number|Number[])} [body.cpf] A CPF, or an array of
 *                                                       CPFs, to be
 *                                                       validated.
 * @param {(String|String[]|Number|Number[])} [body.ddd] A DDD, or an array of
 *                                                       DDDs, to be validated.
 * @param {(String|String[]|Number|Number[])} [body.zipcode] A zipcode, or an
 *                                                           array of zipcodes,
 *                                                           to be validated.
 * @param {(String|String[]|Number|Number[])} [body.phone] A phone number, or
 *                                                         an array of phones,
 *                                                         to be validated.
 *
 *
 * @param {Object|Object[]} [body.card] A card, or an array of cards, to be
 *                                      validated.
 * @param {String} [body.card.card_holder_name] The card's holder name.
 * @param {(String|Number)} [body.card.card_number] The card's number.
 * @param {(String|Number)} [body.card.card_cvv] The card's CVV.
 * @param {(String|Number)} [body.card.card_expiration_date] The card's
 *                                                           expiratation date.
 *
 * @returns {Object} An object that returns each of the supplied properties
 *                   with true or false, indicating if the supplied value is valid
 *                   or invalid.
 **/
const validate = pipe(
  pickExistentValidations(validations),
  applyValidations
)

export default validate
