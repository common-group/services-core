/**
 * @name Search
 * @description This module exposes functions
 *              related to the `/search` path.
 *
 * @module search
 **/

import routes from '../routes'
import request from '../request'

/**
 * `GET /search`
 * Creates a session from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} query The ElasticSearch based
 *                       query object to be sent.
 * {@link https://pagarme.readme.io/v1/reference#elasticsearch|API Reference for this payload}
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const execute = (opts, query) =>
  request.get(opts, routes.search, query)

export default execute
