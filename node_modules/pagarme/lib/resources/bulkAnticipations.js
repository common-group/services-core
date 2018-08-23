/**
 * @name Bulk Anticipations
 * @description This module exposes functions
 *              related to the `/recipients/:recipient_id/bulk_anticipations` path.
 *
 * @module bulkAnticipations
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'


const findOne = curry((opts, body) =>
  request.get(opts, routes.bulkAnticipations.details(body.recipientId, body.id), {})
)

const findAll = curry((opts, body) =>
  request.get(opts, routes.bulkAnticipations.base(body.recipientId), body)
)

/**
 * `GET /recipients/:recipient_id/bulk_anticipations`
 * Makes a request to /recipients/:recipient_id/bulk_anticipations
 * or to /recipients/:recipient_id/bulk_anticipations/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-todas-as-antecipações|API Reference for this payload}
 * @param {String} body.recipientId The recipient ID.
 * @param {String} [body.id] The bulkAnticipation ID. If not sent a
 *                           bulkAnticipation list will be returned instead.
 * @param {Number} [body.count] Pagination option for bulkAnticipation list.
 *                              Number of bulkAnticipation in a page
 * @param {Number} [body.page] Pagination option for bulkAnticipation list.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

const all = (opts, body) =>
  findAll(opts, body)

/**
 * `POST /recipients/:recipient_id/bulk_anticipations`
 * Creates a bulkAnticipation from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-uma-antecipação|API Reference for this payload}
 * @param {String} body.recipientId The recipient ID.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.bulkAnticipations.base(body.recipientId), body)

/**
 * `PUT /recipients/:recipient_id/bulk_anticipations/:id`
 * Updates a bulkAnticipation from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * @param {String} body.recipientId The recipient ID.
 * @param {String} body.id The bulkAnticipation Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const update = (opts, body) =>
  request.put(opts, routes.bulkAnticipations.details(body.recipientId, body.id), body)

/**
 * `DELETE /recipients/:recipient_id/bulk_anticipations/:id`
 * Deletes a bulkAnticipation.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#deletando-uma-antecipação-building|API Reference for this payload}
 * @param {String} body.recipientId The recipient ID.
 * @param {String} body.id The bulkAnticipation Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const destroy = (opts, body) =>
  request.delete(opts, routes.bulkAnticipations.details(body.recipientId, body.id), body)

/**
 * `GET /recipients/:recipient_id/bulk_anticipations/limits`
 * Get bulk anticipations limits for a recipient.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#obtendo-os-limites-de-antecipação|API Reference for this payload}
 * @param {String} body.recipientId The recipient ID.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const limits = (opts, body) =>
  request.get(opts, routes.bulkAnticipations.limits(body.recipientId), body)

/**
 * `GET /recipients/:recipient_id/bulk_anticipations/:id/days`
 * Get bulk anticipations days.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * @param {String} body.recipientId The recipient ID.
 * @param {String} body.id The bulkAnticipation Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const days = (opts, body) =>
  request.get(opts, routes.bulkAnticipations.days(body.recipientId, body.id), body)

/**
 * `POST /recipients/:recipient_id/bulk_anticipations/:id/confirm`
 * Confirm a bulk anticipation.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#confirmando-uma-antecipação-building|API Reference for this payload}
 * @param {String} body.recipientId The recipient ID.
 * @param {String} body.id The bulkAnticipation Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const confirm = (opts, body) =>
  request.post(opts, routes.bulkAnticipations.confirm(body.recipientId, body.id), body)

/**
 * `POST /recipients/:recipient_id/bulk_anticipations/:id/cancel`
 * Cancel a bulk anticipation.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * @param {String} body.recipientId The recipient ID.
 * @param {String} body.id The bulkAnticipation Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const cancel = (opts, body) =>
  request.post(opts, routes.bulkAnticipations.cancel(body.recipientId, body.id), body)

export default {
  find,
  all,
  create,
  update,
  destroy,
  limits,
  days,
  confirm,
  cancel,
}
