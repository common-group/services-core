/**
 * @name BankAccounts
 * @description This module exposes functions
 *              related to the `/bank_accounts` path.
 *
 * @module bankAccounts
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.bankAccounts.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.bankAccounts.base, pagination || {})
)

/**
 * `GET /bank_accounts`
 * Makes a request to /bank_accounts
 *
 * @param {Object} opts - An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body - The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-várias-contas-bancárias|API Reference for this payload}
 * @param {Number} [body.count] - Pagination option for a bank account list.
 *                                Number of bank accounts in a page
 * @param {Number} [body.page] - Pagination option for bank account list.
 *                               The page index.
*/
const all = (opts, body) =>
  findAll(opts, body)

/**
 * `GET /bank_accounts`
 * Makes a request to /bank_accounts or to /bank_accounts/:id
 *
 * @param {Object} opts - An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body - The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-uma-conta-bancária|API Reference for this payload}
 * @param {Number} [body.id] - The bankAccount ID. If not sent a
 *                             bankAccounts list will be returned instead.
 * @param {Number} [body.count] - Pagination option for a bank account list.
 *                                Number of bank accounts in a page
 * @param {Number} [body.page] - Pagination option for bank account list.
 *                               The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `POST /bank_accounts`
 * Creates a bank account from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-uma-conta-bancária|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.bankAccounts.base, body)

export default {
  all,
  create,
  find,
}
