/**
 * @name Recipients
 * @description This module exposes functions
 *              related to the `/recipients` path.
 *
 * @module recipients
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'


const findOne = curry((opts, body) =>
  request.get(opts, routes.recipients.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.recipients.base, pagination || {})
)

/**
 * `GET /recipients`
 * Makes a request to /recipients or to /recipients/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-um-recebedor|API Reference for this payload}
 * @param {String} [body.id] The recipient ID. If not sent a
 *                           recipient list will be returned instead.
 * @param {Number} [body.count] Pagination option for recipient list.
 *                              Number of recipient in a page
 * @param {Number} [body.page] Pagination option for recipient list.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /recipients`
 * Makes a request to /recipients to get all recipients.
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
 * `POST /recipients`
 * Creates a recipient from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-um-recebedor|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.recipients.base, body)

/**
 * `PUT /recipients/:id`
 * Creates a recipient from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#atualizando-um-recebedor|API Reference for this payload}
 * @param {String} body.id The recipient Id
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const update = (opts, body) =>
  request.put(opts, routes.recipients.details(body.id), body)

export default {
  find,
  all,
  create,
  update,
}
