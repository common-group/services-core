'use strict';

const { generateDalContext } = require('../lib/dal');
const { Pool } = require('pg');
const pagarme = require('pagarme');
const R = require('ramda');
const { handleError } = require('../lib/error_handling');

const importMissingPayables = async (dbclient) => {
  try {
    console.log('Starting Import missing payables')

    const dalCtx = generateDalContext(dbclient);
    const catalogPayments = await dalCtx.getPaymentsWithMissingPayables();
    const pagarmeClient = await gatewayClient();

    for (let catalogPayment of catalogPayments.rows) {
      if (catalogPayment.gateway_id) {
        await importMissingPayablesForSingleCatalogPayment(catalogPayment, pagarmeClient, dalCtx);
        await sleep(1000);
      }
    }

    console.log('Import missing payables finished with success')
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
    const payables = await pagarmeClient.payables.find({ transactionId: catalogPayment.gateway_id });

    await dalCtx.updateGatewayDataOnPayment(catalogPayment.id, { transaction, payables })
    await dalCtx.buildGatewayGeneralDataOnPayment(catalogPayment.id, transaction, payables)
  } catch (e) {
    console.log(e)
    console.log(e.response)
    handleError(e)
  }
}

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  statement_timeout: (process.env.STATEMENT_TIMEOUT || 5000)
});

pool.connect()
  .then(async (client) => { await importMissingPayables(client) })
  .catch((e) => { console.log('error', e) })
  .finally(() => { process.exit() })
