'use strict';

const axios = require('axios')

/*
 * authorizationHeader()
 * get api key converted to base
 * @return { Object } header with autorization token
 */
const authorizationHeader = () => {
  const apiKeyBase64 = Buffer.from(process.env.ANTIFRAUD_API_KEY).toString('base64')

  return { 'Authorization': `Basic ${apiKeyBase64}` }
}

/*
 * makeRequest(method, path, data)
 * Make a request to Konduto servers
 * @param { String } method. Eg.: get, post, put
 * @param { String } path. Eg: '/v1/orders'
 * @param { Object } request params
 * @return { Object } antifraud response
 */
const makeRequest = async (method, path, data) => {
  return axios({
    method: method,
    url: `https://api.konduto.com${path}`,
    data: data,
    headers: { ...authorizationHeader() }
  })
}

/*
 * createOrder(data)
 * Create a Konduto order
 * @param { Object } order data
 * @return { Object } antifraud response
 */
const createOrder = (data) => {
  return makeRequest('post', '/v1/orders', data)
}

module.exports = {
  createOrder
}
