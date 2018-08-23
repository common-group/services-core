/**
 * @name Events
 * @description This module exposes functions
 *              related to events.
 *
 * @module events
 **/

import { cond, has, T, curry, both } from 'ramda'

import routes from '../routes'
import request from '../request'

const findAllInTransactions = curry((opts, body) =>
  request.get(opts, routes.events.transaction(body.transactionId), {}))

const findOneInTransactions = curry((opts, body) =>
  request.get(opts, routes.events.transactionDetails(body.id, body.transactionId), {}))

const findAllInSubscriptions = curry((opts, body) =>
  request.get(opts, routes.events.subscription(body.subscriptionId), {}))

const findOneInSubscriptions = curry((opts, body) =>
  request.get(opts, routes.events.subscriptionDetails(body.id, body.subscriptionId), {}))

/**
 * `GET /:model/:model_id/events`
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-todos-os-eventos-de-uma-transação|API Reference for this payload}
 * @param {Number} [body.id] The event ID. If not sent a
 * @param {Number} [body.transactionId] A transaction ID to get all
 *                                      the events.
 * @param {Number} [body.count] Pagination option for transaction list.
 *                              Number of transaction in a page
 * @param {Number} [body.page] Pagination option for transaction list.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [both(has('transactionId'), has('id')), findOneInTransactions(opts)],
    [has('transactionId'), findAllInTransactions(opts)],
    [both(has('subscriptionId'), has('id')), findOneInSubscriptions(opts)],
    [has('subscriptionId'), findAllInSubscriptions(opts)],
    [T, findAllInTransactions(opts)],
  ])(body)

/**
 * `GET /events`
 * Makes a request to /events
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
*/
const findCustom = (opts, body) =>
  request.get(opts, routes.events.base, body)

export default {
  find,
  findCustom,
}
