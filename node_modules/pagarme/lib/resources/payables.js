/**
 * @name Payables
 * @description This module exposes functions
 *              related to payables.
 *
 * @module payables
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findTransaction = curry((opts, body) =>
  request.get(opts, routes.payables.transaction(body.transactionId), {}))

const findOne = curry((opts, body) =>
  request.get(opts, routes.payables.find(body.id), {}))

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.payables.base, pagination))
/**
 * `GET /payables`
 * Makes a request to /payables or to /payables/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-um-recebível|API Reference for this payload}
 * @param {Number} [body.id] The payable ID. If not sent a
 * @param {Number} [body.transactionId] A transaction ID to get all
 *                                      the payables.
 * @param {Number} [body.count] Pagination option for transaction list.
 *                              Number of transaction in a page
 * @param {Number} [body.page] Pagination option for transaction list.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [has('transactionId'), findTransaction(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /payables`
 * Makes a request to /payables
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://docs-beta.pagar.me/v1/reference#retornando-recebíveis}
*/
const all = (opts, body) =>
  findAll(opts, body)

export default {
  find,
  all,
}
