/**
 * @name Transfers
 * @description This module exposes functions
 *              related to the `/itransfers` path.
 *
 * @module transfers
 **/
import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.transfers.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.transfers.base, pagination || {})
)


/**
 * `GET /transfers`
 * Makes a request to /transfers or to /transfers/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#vendo-dados-de-uma-transferência|API Reference for this payload}
 * @param {Number} [body.id] The transfer's ID. If not sent a
 *                           transfers list will be returned instead.
 * @param {Number} [body.count] Pagination option to get a list of transfers.
 *                              Number of transfers in a page
 * @param {Number} [body.page] Pagination option for a list of transfers.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /transfers`
 * Makes a request to /transfers to get all transfers.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#vendo-dados-de-várias-transferências|API Reference for this payload}
 * @param {Number} [body.count] Pagination option to get a list of transfers.
 *                              Number of transfers in a page
 * @param {Number} [body.page] Pagination option for a list of transfers.
 *                             The page index.
*/
const all = (opts, pagination) =>
  findAll(opts, pagination)

/**
 * `POST /transfers`
 * Creates a transfer from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-uma-transferência|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.transfers.base, body)

/**
 * `POST /transfers/:id/cancel`
 * Cancels a transfer
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#cancelando-uma-transferência|API Reference for this payload}
 * @param {Number} body.id The transfer's ID
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const cancel = (opts, body) =>
  request.post(opts, routes.transfers.cancel(body.id), {})


/**
 * `GET /transfers/days`
 * Returns company's transfers aggregated by day
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
*/
const days = opts =>
  request.get(opts, routes.transfers.days, {})

/**
 * `GET /transfers/limits`
 * Returns company's transfers limits
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
*/
const limits = opts =>
  request.get(opts, routes.transfers.limits, {})

export default {
  find,
  all,
  create,
  cancel,
  days,
  limits,
}
