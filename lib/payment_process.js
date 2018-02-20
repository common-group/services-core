'use strict';

/*
 * isForeign(ctx)
 * ctx(Object) - generated context for execution (generated on dal module)
 * Check if payment is_international value return boolean 
 * true when payment is from foreign payer
 * false when payment is national
 */
const isForeign = (ctx) => {
    return  (ctx.payment.data.is_international || false);
};


module.exports = {isForeign};
