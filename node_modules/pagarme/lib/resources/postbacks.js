/**
 * @name Postbacks
 * @description This module exposes functions
 *              related to postbacks.
 *
 * @module postbacks
 **/

import { cond, has, T, curry, both } from 'ramda'

import routes from '../routes'
import request from '../request'

const findAllInTransactions = curry((opts, body) =>
  request.get(opts, routes.postbacks.transaction(body.transactionId), {}))

const findOneInTransactions = curry((opts, body) =>
  request.get(opts, routes.postbacks.transactionDetails(body.id, body.transactionId), {})
)

const findAllInSubscriptions = curry((opts, body) =>
  request.get(opts, routes.postbacks.subscription(body.subscriptionId), {}))

/**
 * `GET /:model/:model_id/postbacks`
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-um-postback|API Reference for this payload}
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
 * `POST /:model/:model_id/postbacks/:id/redeliver`
 * Redeliver a POSTback for a model
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#reenviando-um-postback|API Reference for this payload}
 * @param {Number} body.id The operation ID.
 * @param {Number} body.subscriptionId A subscription ID
*/
const redeliver = (opts, body) =>
  request.post(opts, routes.postbacks.redeliver(body.subscriptionId, body.id), {})

export default {
  find,
  redeliver,
}
