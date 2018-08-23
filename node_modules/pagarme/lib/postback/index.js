/**
 * @name Postback
 * @description This module exposes functions
 *              related to postback validations.
 *              This can also be found in client.security if
 *              you already used pagarme.connect to pre apply
 *              your api_key.
 *
 * @module postback
 **/
import {
  equals,
} from 'ramda'
import { createHmac } from 'crypto'

/**
 * Generates a hash signed with a key.
 *
 * @param {String} key the keys used to sign the hash.
 *
 * @param {String} string The string to be hashed.
 *
*/
function calculateSignature (key, postbackBody) {
  return createHmac('sha1', key)
    .update(postbackBody)
    .digest('hex')
}

/**
 * Verifies a hash signed with a key.
 *
 * @param {String} key the keys used to sign the hash.
 *
 * @param {String} string The string to be hashed.
 *
 * @param {String} expected The expected result.
 *
*/
function verifySignature (key, postbackBody, headerSignature) {
  const signature = calculateSignature(key, postbackBody)
  return equals(signature, headerSignature)
}

export default {
  calculateSignature,
  verifySignature,
}
