const {test} = require('ava');
const {isForeign} = require('../lib/payment_process');

test('test isForeign with is_international = true', t => {
    const ctx = {
        payment: {
            data: {
                is_international: true
            }
        }
    };

	t.is(isForeign(ctx), true);
});

test('test isForeign with is_international = false', t => {
    const ctx = {
        payment: {
            data: {
                is_international: false
            }
        }
    };

	t.is(isForeign(ctx), false);
});

test('test isForeign with is_international not setted', t => {
    const ctx = {
        payment: {
            data: {
            }
        }
    };

	t.is(isForeign(ctx), false);
});
