/**
 * @name Split Rules
 * @description This module exposes functions
 *              related to the `/transactions/:transactionId/split_rules` path.
 *
 * @module splitRules
 **/

import { cond, has, curry, both } from 'ramda'

import routes from '../routes'
import request from '../request'

const findAll = curry((opts, body) =>
  request.get(opts, routes.splitRules.findAll(body.transactionId), {})
)

const findOne = curry((opts, body) => {
  const { transactionId, id } = body
  return request.get(opts, routes.splitRules.find(transactionId, id), {})
})

/**
 * `GET /transactions/:transactionId/split_rules`
 * Makes a request to /transactions/:transactionId/split_rules or
 * to /transactions/:transactionId/split_rules/:id
 *
 * @param {Object} opts - An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body - The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-as-regras-de-divisão-de-uma-transação|API Reference for this payload}
 * @param {Number} body.transactionId - A specific transaction ID
 *
 * @param {Number} [body.id] - The splitRule's ID. If not sent, a splitRules
 *                                                 list will be returned
 *                                                 instead.
 */
const find = (opts, body) =>
  cond([
    [both(has('transactionId'), has('id')), findOne(opts)],
    [has('transactionId'), findAll(opts)],
  ])(body)

export default {
  find,
}
