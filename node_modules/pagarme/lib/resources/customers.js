/**
 * @name Customers
 * @description This module exposes functions
 *              related to the `/customers` path.
 *
 * @module customers
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'


const findOne = curry((opts, body) =>
  request.get(opts, routes.customers.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
    request.get(opts, routes.customers.base, pagination || {})
)

/**
 * `GET /customers`
 * Makes a request to /customers or to /customers/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#retornando-dados-do-cliente|API Reference for this payload}
 * @param {Number} [body.id] The customer ID. If not sent, a
 *                           customer list will be returned instead.
 * @param {Number} [body.count] Pagination option for customer list.
 *                              Number of customers in a page
 * @param {Number} [body.page] Pagination option for customer list.
 *                             The page index.
 */
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /customers`
 * Returns company's customers
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-clientes|API Reference for this payload}
 * @param {Number} [body.count] Pagination option to get a list of customers.
 *                              Number of customers in a page
 * @param {Number} [body.page] Pagination option for a list of customers.
 *                             The page index.
*/
const all = (opts, body) =>
  findAll(opts, body)

/**
 * `POST /customers`
 * Creates a customer from the given payload
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-um-cliente|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.customers.base, body)

export default {
  find,
  all,
  create,
}
