/**
 * @name User
 * @description This module exposes functions
 *              related to the `/users` path.
 *
 * @module user
 **/

import { cond, has, T, curry } from 'ramda'

import routes from '../routes'
import request from '../request'

const findOne = curry((opts, body) =>
  request.get(opts, routes.user.details(body.id), {})
)

const findAll = curry((opts, pagination) =>
  request.get(opts, routes.user.base, pagination || {})
)

/**
 * `GET /users`
 * Makes a request to /users or to /users/:id
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request.
 * @param {Number} [body.id] The user's ID. If not sent a
 *                           users list will be returned instead.
 * @param {Number} [body.count] Pagination option to get a list of users.
 *                              Number of users in a page
 * @param {Number} [body.page] Pagination option for a list of users.
 *                             The page index.
*/
const find = (opts, body) =>
  cond([
    [has('id'), findOne(opts)],
    [T, findAll(opts)],
  ])(body)

/**
 * `PUT /users/reset_password`
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 * @param {String} email The email of the account
 *                       of which the password will
 *                       be reset.
 * @returns {Promise} Resolves to the result
 *                    of the request or an error.
 */
const resetPassword = (opts, body) =>
  request.put(opts, routes.user.resetPassword, body)

/**
 * `PUT /users/redefine_password`
 * Redefines a user's password based on a reset token
 *
 * @example
 *
 * client.user.redefinePassword()
 *
 * @param {Objec} opts An options params which
 *                     is usually already bound
 *                     by `connect` functions.
 * @param {Object} body An object containing the
 *                      reset token and email of
 *                      the account.
 * @returns {Promise} Resolves to the result
 *                    of the request or an error.
 */
const redefinePassword = (opts, body) =>
  request.put(opts, routes.user.redefinePassword, body)

/**
 * `POST /users/`
 * Creates a user
 *
 * @param {Objec} opts An options params which
 *                     is usually already bound
 *                     by `connect` functions.
 * @param {Object} body The payload for the request.
 */
const create = (opts, body) =>
  request.post(opts, routes.user.base, body)

/**
 * `GET /users`
 * Makes a request to /users
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Number} [body.count] Pagination option to get a list of users.
 *                              Number of users in a page
 * @param {Number} [body.page] Pagination option for a list of users.
 *                             The page index.
*/
const all = (opts, body) =>
  findAll(opts, body)

/**
 * `DELETE /users/:id`
 * Deletes an user from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {String} [body.id] - The user ID. If not sent an
 *                           user list will be returned instead
 *
 * @returns {Promise} Resolves to the result of
 *                    the request or to an error.
 */
const destroy = (opts, body) =>
  request.delete(opts, routes.user.details(body.id), {})

/**
 * `PUT /users/:id`
 * Updates a user from the given payload.
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 *
 * @returns {Promise} A promise that resolves to
 *                    the newly created user's
 *                    data or to an error.
 **/
const update = (opts, body) =>
  request.put(opts, routes.user.details(body.id), body)

/**
 * `PUT /user/:id/update_password`
 * Updates a user's password from the given payload.
 *
 * @example
 *  client.user.updatePassword({ id:'123', current_password: 'foo', new_password: 'bar' })
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @param {Object} body The payload for the request
 *
 * @returns {Promise} A promise that resolves to
 *                    the newly created user's
 *                    data or to an error.
 **/
const updatePassword = (opts, body) =>
  request.put(opts, routes.user.updatePassword(body.id), body)

/**
 * `GET /user`
 * Returns the currently authenticated user
 *
 * @param {Object} opts An options params which
 *                      is usually already bound
 *                      by `connect` functions.
 *
 * @returns {Promise} A promise that resolves to
 *                    the newly created user's
 *                    data or to an error.
 */
const current = opts =>
  request.get(opts, routes.user.singular, {})

export default {
  all,
  create,
  current,
  destroy,
  find,
  redefinePassword,
  resetPassword,
  update,
  updatePassword,
}

