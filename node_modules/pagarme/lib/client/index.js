/**
 * Client Module
 * @description The client module is the entry point for our SDK.
 *              It holds a Promise-based authentication method
 *              ([connect]{@link client#connect}) as well as
 *              allowing for raw use of the resources (without authentication).
 * @module client
 */

import {
  merge,
  map,
  equals,
  type,
  ifElse,
} from 'ramda'

import strategies from './strategies'
import resources from '../resources'

const isFunction = x => equals(type(x), 'Function')

/**
 * Binds the `options` received as param
 * to the client's resources.
 * @private
 *
 * @param {Object} options
 * @returns A version of resources with its methods' first param binded to `options`
 */
function bindClientOptions ({ options, authentication }) {
  const bindOptions = func => func.bind(null, options)

  const bindRecursive = ifElse(
    isFunction,
    bindOptions,
    resource => map(bindRecursive, resource)
  )

  const boundClient = map(bindRecursive, resources)
  return merge(boundClient, { authentication })
}

/**
 * Returns a version of client with
 * authentication data binded to the
 * resource requests.
 *
 * @example
 * // API Key Authentication
 * pagarme.client.connect({ api_key: 'ak_test_y7jk294ynbzf93' })
 *
 * // Encryption Key Authentication
 * pagarme.client.connect({ encryption_key: 'ek_test_y7jk294ynbzf93' })
 *
 * // Login Authentication
 * pagarme.client.connect({ email: 'user@email.com', password: '123456' })
 *
 * @param {Object} authentication
 * @returns {Promise} A Promise that resolves to a client with authentication data binded
 */
function connect (authentication) {
  return strategies
    .find(authentication)
    .then(s => s.execute())
    .then(bindClientOptions)
}

const client = merge({ connect }, resources)

export default client
