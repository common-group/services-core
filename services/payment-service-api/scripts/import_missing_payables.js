'use strict';

const { generateDalContext } = require('../lib/dal');
const pagarme = require('pagarme');
const R = require('ramda');
const { handleError } = require('../lib/error_handling');

const importMissingPayables = async (dbclient) => {
  try {
    const dalCtx = generateDalContext(dbclient);
    const catalogPayments = await dalCtx.getPaymentsWithMissingPayables();
    const pagarmeClient = await gatewayClient();

    R.forEach(async (catalogPayment) => {
      try {
        const transaction = await pagarmeClient.transactions.find({ id: catalogPayment.gateway_id })
        const payables = await pagarmeClient.payables.find({ transactionId: catalogPayment.gateway_id });
        await dalCtx.buildGatewayGeneralDataOnPayment(catalogPayment.id, transaction, payables)
      } catch (e) {
        handleError(e)
        console.log(e)
        console.log(e.response)
      }
    }, catalogPayments.rows);
  } catch (e) {
    handleError(e)
    console.log(e)
    console.log(e.response)
  }
};

const gatewayClient = async () => {
  return await pagarme.client.connect({api_key: process.env.GATEWAY_API_KEY});
};

module.exports = {
  importMissingPayables
}
