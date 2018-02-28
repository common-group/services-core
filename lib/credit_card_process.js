'use strict';

const R = require('ramda');
const { gatewayClient } = require('./payment_process');
const { generateDalContext } = require('./dal');

/*
 * createGatewayCard(card_id)
 * create a credit card on gateway
 * @params { uuid } card_id - credit card id
 *
 * @return { Object } card - gateway credit_card objet
 */
const createGatewayCard = async (card_hash) => {
    return await (await gatewayClient()).cards.create({
        card_hash: card_hash
    });
};

/*
 * processCardCreation(dbclient, card_id)
 * start processing a new creation of credit card
 * @param { Object } dbclient - pg client connection
 * @param { uuid } card_id - payment_service.credit_cards(id)
 *
 * @return { Object } card - updated payment_service.credit_cards
 */
const processCardCreation = async (dbclient, card_id) => {
    const dalCtx = await generateDalContext(dbclient),
        card = await dalCtx.findCard(card_id),
        hasGatewayID = !R.isNil(card.gateway_data.id),
        hasCardHash = !R.isNil(card.data.card_hash);

    if( !hasGatewayID && hasCardHash ) {
        const gateway_card = await createGatewayCard(card.data.card_hash);
        return await dalCtx.updateCardFromGateway(card_id, gateway_card);
    } else {
        throw new Error('card already processed');
    }
};

module.exports = {
    createGatewayCard,
    processCardCreation
};

