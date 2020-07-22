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
      if (catalogPayment.gateway_id) {
        setTimeout(async () => {
          await importMissingPayablesForSingleCatalogPayment(catalogPayment, pagarmeClient, dalCtx);
        }, 1000);
      }
    }, catalogPayments.rows);
  } catch (e) {
    console.log(e)
    console.log(e.response)
    handleError(e)
  }
};

const gatewayClient = async () => {
  return await pagarme.client.connect({api_key: process.env.GATEWAY_API_KEY});
};

const importMissingPayablesForSingleCatalogPayment = async (catalogPayment, pagarmeClient, dalCtx) => {
  try {
    console.log('###########', 'importing missing payables for transaction_id:', catalogPayment.gateway_id, '##############')
    const transaction = await pagarmeClient.transactions.find({ id: catalogPayment.gateway_id })
    console.log('transaction', transaction);
    const payables = await pagarmeClient.payables.find({ transactionId: catalogPayment.gateway_id });
    console.log('payables', payables);
    await dalCtx.buildGatewayGeneralDataOnPayment(catalogPayment.id, transaction, payables)
  } catch (e) {
    console.log(e)
    console.log(e.response)
    handleError(e)
  }
}

module.exports = {
  importMissingPayables,
  importMissingPayablesForSingleCatalogPayment
}
