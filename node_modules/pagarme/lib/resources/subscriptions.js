/**
 * @name Subscriptions
 * @description This module exposes functions
 *              related to the `/subscriptions` path.
 *
 * @module subscriptions
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.subscriptions.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.subscriptions.base, pagination || {})
)

/**
 * `GET /subscriptions`
 * Makes a request to /subscriptions or to /subscriptions/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-uma-assinatura|API Reference for this payload}
 * @param {Number} [body.id] The subscription's ID. If not sent a
 *                           subscriptions list will be returned instead.
 * @param {Number} [body.count] Pagination option to get a list of subscriptions.
 *                              Number of subscriptions in a page
 * @param {Number} [body.page] Pagination option for a list of subscriptions.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /subscriptions`
 * Makes a request to /subscriptions to get all subscriptions.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Number} [body.count] Pagination option to get a list of subscriptions.
 *                              Number of subscriptions in a page
 * @param {Number} [body.page] Pagination option for a list of subscriptions.
 *                             The page index.
*/
const all = (opts, body) =>
  findAll(opts, body)

/**
 * `POST /subscriptions`
 * Creates a subscription from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-assinaturas|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.subscriptions.base, body)

/**
 * `PUT /subscriptions/:id`
 * Updates a subscription from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#atualizando-uma-assinatura|API Reference for this payload}
 * @param {Number} body.id The subscription's ID
 * @returns {Promise} A promise that resolves to
 *                    the newly created subscriptions's
 *                    data or to an error.
 */
const update = (opts, body) =>
  request.put(opts, routes.subscriptions.details(body.id), body)

/**
 * `POST /subscriptions/:id/cancel`
 * Cancels a subscription
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#cancelando-uma-assinatura|API Reference for this payload}
 * @param {Number} body.id The subscription's ID
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const cancel = (opts, body) =>
  request.post(opts, routes.subscriptions.cancel(body.id), {})

/**
 * `POST /subscriptions/:id/transactions`
 * Creates a transaction for a subscription
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * @param {Number} body.id The subscription's ID
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const createTransaction = (opts, body) =>
  request.post(opts, routes.subscriptions.transactions(body.id), body)

/**
 * `GET /subscriptions/:id/transactions`
 * Gets transactions for a subscription
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#transações-em-uma-assinatura|API Reference for this payload}
 * @param {Number} body.id The subscription's ID
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const findTransactions = (opts, body) =>
  request.get(opts, routes.subscriptions.transactions(body.id), {})

export default {
  all,
  find,
  findAll,
  create,
  update,
  cancel,
  createTransaction,
  findTransactions,
}
