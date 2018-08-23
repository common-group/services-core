/**
 * @name Transactions
 * @description This module exposes functions
 *              related to the `/transactions` path.
 *
 * @module transactions
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'


const findOne = curry((opts, body) =>
  request.get(opts, routes.transactions.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.transactions.base, pagination || {})
)

/**
 * `GET /transactions`
 * Makes a request to /transactions or to /transactions/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/reference#retornando-transações|API Reference for this payload}
 * @param {Number} [body.id] The transaction ID. If not sent a
 *                           transaction list will be returned instead.
 * @param {Number} [body.count] Pagination option for transaction list.
 *                              Number of transaction in a page
 * @param {Number} [body.page] Pagination option for transaction list.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /transactions`
 * Makes a request to /transactions to get all transactions.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Number} [body.count] Pagination option for recipient list.
 *                              Number of recipient in a page
 * @param {Number} [body.page] Pagination option for recipient list.
 *                             The page index.
*/
const all = (opts, body) =>
  findAll(opts, body)

/**
 * `POST /transactions`
 * Creates a transaction from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/reference#criar-transação|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.transactions.base, body)

/**
 * `POST /transactions/:id/capture`
 * Captures a transaction from the given id.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Number} body.id The transaction ID.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const capture = (opts, body) =>
  request.post(opts, routes.transactions.capture(body.id), body)

/**
 * `POST /transactions/:id/refund`
 * Refunds a transaction from the given id.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/reference#estorno-de-transação|API Reference for this payload}
 *
 * @param {Number} body.id The transaction ID.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const refund = (opts, body) =>
  request.post(opts, routes.transactions.refund(body.id), body)

/**
 * `POST /transactions/:id/collect_payment`
 * Sends a payment link to a customer
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/reference#notificando-cliente-sobre-boleto-a-ser-pago|API Reference for this payload}
 * @param {Number} body.id - The transaction id
 * @param {String} body.email - User email to send the
 *                              payment request
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const collectPayment = (opts, body) =>
  request.post(opts, routes.transactions.collectPayment(body.id), body)

/**
 * `GET /transactions/card_hash_key`
 * Create a card hash key
 *
 * @param {Object} opts - An options params which
 *                        is usually already bound
 *                        by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://dash.readme.io/project/pagarme/v1/refs/gerando-card_hash-manualmente-1|API Reference for this payload}
 *
 * @returns {Promise} - Resolves to the result of
 *                      the request or to an error.
 */
const cardHashKey = opts =>
  request.get(opts, routes.transactions.cardHashKey, {})

/**
 * `PUT /transactions/:id`
 * Updates a transaction from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 *
 * @param {Number} body.id The transaction ID
 * @param {Number} body.status The transaction status
 * @returns {Promise} A promise that resolves to
 *                    the newly created transactions's
 *                    data or to an error.
 **/
const update = (opts, body) =>
  request.put(opts, routes.transactions.details(body.id), body)

/**
 * `GET /transactions/calculate_installments_amount`
 * Calculates the value of each purchase's installments
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Number} body.interest_rate - The interest rate's value.
 * @param {Number} body.amount - The value of the purchase.
 * @param {Number} [body.max_installments] - The max number of installments.
 * @param {Number} [body.free_installments] - The number of installments without interest.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const calculateInstallmentsAmount = (opts, body) =>
  request.get(opts, routes.transactions.calculateInstallmentsAmount, body)

export default {
  find,
  all,
  capture,
  create,
  refund,
  collectPayment,
  cardHashKey,
  update,
  calculateInstallmentsAmount,
}
