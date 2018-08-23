/**
 * @name Plans
 * @description This module exposes functions
 *              related to the `/plans` path.
 *
 * @module plans
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.plans.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.plans.base, pagination || {})
)

/**
 * `GET /plans`
 * Makes a request to /plans or to /plans/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-um-plano|API Reference for this payload}
 * @param {Number} [body.id] The plan's ID. If not sent a
 *                           plans list will be returned instead.
 * @param {Number} [body.count] Pagination option to get a list of plans.
 *                              Number of plans in a page
 * @param {Number} [body.page] Pagination option for a list of plans.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `GET /plans`
 * Makes a request to /plans
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * {@link https://pagarme.readme.io/v1/reference#retornando-planos|API Reference for this payload}
 * @param {Number} [body.count] Pagination option to get a list of plans.
 *                              Number of plans in a page
 * @param {Number} [body.page] Pagination option for a list of plans.
 *                             The page index.
*/
const all = (opts, pagination) =>
  findAll(opts, pagination)

/**
 * `POST /plans`
 * Creates a plan from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#criando-planos|API Reference for this payload}
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.plans.base, body)

/**
 * `PUT /plans/:id`
 * Updates a plans from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 * {@link https://pagarme.readme.io/v1/reference#atualizando-planos|API Reference for this payload}
 * @param {Number} body.id The plan's ID
 * @param {String} [body.name] The plan's name
 * @param {Number} [body.trial_days] The number of days to test the plan with
 *                                   no charges
 * @returns {Promise} A promise that resolves to
 *                    the newly created plans's
 *                    data or to an error.
 */
const update = (opts, body) =>
  request.put(opts, routes.plans.details(body.id), body)

export default {
  all,
  find,
  findAll,
  create,
  update,
}

