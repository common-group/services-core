'use strict';

/*
 * limitStringSize(string, stringSize)
 * Limit string size
 * @param { String } string - String to limit size
 * @param { String } stringSize - Desired string size
 * @return { String } - String with size limited
 */
const limitStringSize = (string, stringSize) => {
  return String(string || '').substring(0, stringSize)
}

module.exports = {
  limitStringSize
}
