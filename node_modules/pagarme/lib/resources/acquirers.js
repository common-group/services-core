/**
 * @name Acquirers
 * @description This module exposes functions
 *              related to the `/acquirers` and
 *              `/acquirers` paths.
 *
 * @module acquirers
 **/

import { cond, has, T, curry } from 'ramda'
import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.acquirers.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.acquirers.base, pagination || {})
)

/**
 * `GET /acquirers`
 * Makes a request to /acquirers or to /acquirers/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * @param {Number} [body.id]  The acquirer's ID. If not sent a
 *                            list of acquirer will be returned instead.
 * @param {Number} [body.count] Pagination option to get a list of acquirers.
 *                              Number of acquirers in a page.
 * @param {Number} [body.page] Pagination option for a list of acquirers.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /acquirers`
 * Makes a request to /acquirers
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * @param {Number} [body.count] Pagination option to get a list of acquirers
 *                              Number of acquirers in a page.
 * @param {Number} [body.page] Pagination option for a list of acquirers.
 *                             The page index.
*/
const all = (opts, pagination) =>
  findAll(opts, pagination)

/**
 * `POST /acquirers`
 * Creates an acquirer from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.acquirers.base, body)

/**
 * `PUT /acquirers/:id`
 * Updates an acquirer from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * @param {Number} body.id The acquirer's ID
 * @returns {Promise} A promise that resolves to
 *                    the newly created acquirer's
 *                    data or to an error.
 */
const update = (opts, body) =>
  request.put(opts, routes.acquirers.details(body.id), body)

export default {
  all,
  find,
  findAll,
  create,
  update,
}
