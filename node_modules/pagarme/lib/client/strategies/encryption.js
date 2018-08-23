/**
 * @name encryption
 * @memberof strategies
 * @private
 */
import { merge } from 'ramda'
import transactions from '../../resources/transactions'

/**
 * Creates an object with
 * the `encryption_key` from
 * the supplied `options` param
 *
 * @param {any} options
 * @returns {Object} an object containing
 *                   a body property with
 *                   the desired `encryption_key`
 * @private
 */
function execute (opts) {
  const { encryption_key, options } = opts
  const body = {
    body: {
      encryption_key,
    },
  }
  if (options && options.baseURL) {
    body.baseURL = options.baseURL
  }
  return transactions.calculateInstallmentsAmount(body, { amount: 1, interest_rate: 100 })
    .catch((error) => {
      if (opts.skipAuthentication) { return }
      if (error.name === 'ApiError') {
        throw new Error('You must supply a valid encryption key')
      }
      console.warn(`Warning: Could not verify key. Pagar.me may be offline ${error.name}`)
    })
    .then(() => merge(body, opts.options))
    .then(requestOpts => ({
      authentication: { encryption_key },
      options: requestOpts,
    }))
}

/**
 * Returns the supplied parameter with
 * the `execute` function added to it.
 *
 * @param {any} options
 * @returns {Object} The `options` parameter
 *                   with `execute` add to it
 * @private
 */
function build (options) {
  return merge(options, { execute: execute.bind(null, options) })
}

export default {
  build,
}
