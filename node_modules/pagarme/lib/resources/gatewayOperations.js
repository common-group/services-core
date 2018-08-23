/**
 * @name Gateway Operations
 * @description This module exposes functions
 *              related to events.
 *
 * @module gatewayOperations
 **/

import { cond, has, T, curry, both } from 'ramda'

import routes from '../routes'
import request from '../request'

const findAllInTransactions = curry((opts, body) =>
  request.get(opts, routes.gatewayOperations.transaction(body.transactionId), {}))

const findOneInTransactions = curry((opts, body) =>
  request.get(opts, routes.gatewayOperations.transactionDetails(body.id, body.transactionId), {})
)

const findAllInSubscriptions = curry((opts, body) =>
  request.get(opts, routes.gatewayOperations.subscription(body.subscriptionId), {}))

/**
 * `GET /:model/:model_id/operations`
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-todo-histórico-de-uma-transação|API Reference for this payload}
 * @param {Number} [body.id] The operation ID. If not sent a
 * @param {Number} [body.transactionId] A transaction ID to get all
 *                                      the operations.
 * @param {Number} [body.subscriptionId] A subscription ID
*/
const find = (opts, body) =>
  cond([
    [both(has('transactionId'), has('id')), findOneInTransactions(opts)],
    [has('transactionId'), findAllInTransactions(opts)],
    [has('subscriptionId'), findAllInSubscriptions(opts)],
    [T, findAllInTransactions(opts)],
  ])(body)

/**
 * `GET /:model/:model_id/operations/:id/refuse_message`
 * Returns the refuse message for a gateway operation
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * @param {Number} body.id The operation ID.
 * @param {Number} [body.subscriptionId] A subscription ID
*/
const refuseMessage = (opts, body) =>
  request.get(opts, routes.gatewayOperations.refuseMessage(body.subscriptionId, body.id), {})

export default {
  find,
  refuseMessage,
}
