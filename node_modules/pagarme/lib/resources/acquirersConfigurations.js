/**
 * @name Acquirer's Configurations
 * @description This module exposes functions
 *              related to the `/acquirers_configurations` and
 *              `/acquirers_configuration` paths.
 *
 * @module acquirersConfigurations
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.acquirersConfigurations.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.acquirersConfigurations.base, pagination || {})
)

/**
 * `GET /acquirers_configurations`
 * Makes a request to /acquirers_configurations or to /acquirers_configuration/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * @param {Number} [body.id]  The acquirer's configuration ID. If not sent a
 *                            list of acquirer's configuration will be returned instead.
 * @param {Number} [body.count] Pagination option to get a list of acquirer's
 *                              configurations.
 *                              Number of configurations in a page
 * @param {Number} [body.page] Pagination option for a list of acquirer's
 *                             configurations.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /acquirers_configurations`
 * Makes a request to /acquirers_configurations
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * @param {Number} [body.count] Pagination option to get a list of acquirer's
 *                              configurations.
 *                              Number of configurations in a page
 * @param {Number} [body.page] Pagination option for a list of acquirer's
 *                             configurations.
 *                             The page index.
*/
const all = (opts, pagination) =>
  findAll(opts, pagination)

/**
 * `POST /acquirers_configurations`
 * Creates an acquirer's configuration from the given payload.
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
  request.post(opts, routes.acquirersConfigurations.base, body)

/**
 * `PUT /acquirers_configuration/:id`
 * Updates an acquirer's configuration from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * @param {Number} body.id The acquirer's configuration ID
 * @returns {Promise} A promise that resolves to
 *                    the newly created acquirer's configurations
 *                    data or to an error.
 */
const update = (opts, body) =>
  request.put(opts, routes.acquirersConfigurations.details(body.id), body)

export default {
  all,
  find,
  findAll,
  create,
  update,
}
