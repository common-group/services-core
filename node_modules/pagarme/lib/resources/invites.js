/**
 * @name Invites
 * @description This module exposes functions
 *              related to the `/invites` path.
 *
 * @module invites
 **/

import { cond, has, T, curry } from 'ramda'
import routes from '../routes'
import request from '../request'


const findOne = curry((opts, body) =>
  request.get(opts, routes.invites.details(body.id), {})
)

const findAll = opts =>
  request.get(opts, routes.invites.base, {})

/**
 * `GET /invites`
 * Makes a request to /invites or to /invites/:id
 *
 * @param {Object} opts - An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body - The payload for the request.
 * @param {String} [body.id] - The invite ID. If not sent an
 *                           invite list will be returned instead
 */
const find = (opts, body = {}) =>
  cond([
    [has('id'), findOne(opts)],
    [T, () => findAll(opts)],
  ])(body)

/**
 * `GET /invites`
 * Makes a request to /invites to get all invites.
 *
*/
const all = opts =>
  findAll(opts)

/**
 * `POST /invites`
 * Creates an invite from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body A payload that contains
 *                      email and permission
 *                      of the invited person.
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const create = (opts, body) =>
  request.post(opts, routes.invites.base, body)

/**
 * `DELETE /invites`
 * Deletes an invite from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {String} [body.id] - The invite ID. If not sent an
 *                           invite list will be returned instead
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const destroy = (opts, body) =>
  request.delete(opts, routes.invites.details(body.id), {})

export default {
  find,
  all,
  create,
  destroy,
}
