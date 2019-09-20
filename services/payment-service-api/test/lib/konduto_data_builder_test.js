'use strict';

const test = require('ava');
const R = require('ramda');
const { buildAntifraudData } = require('../../lib/konduto_data_builder');

const sampleContext = () => {
  return {
    payment: {
      id: 'payment-id-here',
      user_id: 'user-id-here',
      created_at: '2019-01-01 00:00:00Z000',
      data: {
        amount: 12345,
        current_ip: '127.0.0.1',
        credit_card_owner_document: '12345678901',
        customer: {
          name: 'John Appleseed',
          document_number: '10987654321',
          email: 'email@example.com',
          phone: {
            ddi: '55',
            ddd: '85',
            number: '32001000'
          },
          address: {
            street: 'Rua 1',
            complementary: 'Complement',
            city: 'Fortaleza',
            state: 'CE',
            zipcode: '60000420',
            country_en: 'Australia'

          }
        }
      }
    },
    user: {
      created_at: '2018-01-01 00:00:00Z000'
    },
    payment_card: {
      gateway_data: {
        first_digits: '123456',
        last_digits: '7890',
        expiration_date: '1222'
      }
    },
    subscription: {
      reward_id: 'reward-id-here',
      created_at: '2019-12-31 00:00:00Z000'
    },
    project: {
      data: {
        name: 'Project Name'
      }
    },
    project_owner: {
      id: 'project-owner-id-here',
      data: {
        name: 'Project Owner'
      },
      created_at: '2017-01-01 00:00:00Z000'
    }
  }
}

const expectedAntifraudData = (overwrite) => {
  let data = {
    id: 't-id',
    visitor: 'user-id-here',
    total_amount: 123.45,
    currency: 'BRL',
    installments: 1,
    ip: '127.0.0.1',
    purchased_at: '2019-01-01 00:00:00Z',
    analyze: undefined,
    customer: {
      id: 'user-id-here',
      name: 'John Appleseed',
      tax_id: '12345678901',
      phone1: '558532001000',
      email: 'email@example.com',
      created_at: '2018-01-01',
    },
    payment: [{
      type: 'credit',
      bin: '123456',
      last4: '7890',
      expiration_date: '122022',
      status: undefined
    }],
    billing: {
      name: 'John Appleseed',
      address1: 'Rua 1',
      address2: 'Complement',
      city: 'Fortaleza',
      state: 'CE',
      zip: '60000420',
      country: 'AU'
    },
    shopping_cart: [{
      product_code: 'reward-id-here',
      category: 9999,
      name: '123.45 - Project Name',
      unit_cost: 123.45,
      quantity: 1,
      created_at: '2019-12-31'
    }],
    seller: {
      id: 'project-owner-id-here',
      name: 'Project Owner',
      created_at: '2017-01-01'
    }
  }

  return R.mergeDeepRight(data, overwrite);
}

test('test buildAntifraudData - approved on gateway', async t => {
  const context = sampleContext()
  const antifraudData = buildAntifraudData(context, { shouldAnalyze: true, transaction: { id: 't-id' } })
  const expectedData = expectedAntifraudData({
    analyze: true,
    payment: [{
      type: 'credit',
      bin: '123456',
      last4: '7890',
      expiration_date: '122022',
      status: 'approved'
    }]
  })

  t.deepEqual(antifraudData, expectedData)
});

test('test buildAntifraudData - declined on gateway', async t => {
  const context = sampleContext()
  const antifraudData = buildAntifraudData(context, { shouldAnalyze: false, transaction: { id: 't-id' } })
  const expectedData = expectedAntifraudData({
    analyze: false,
    payment: [{
      type: 'credit',
      bin: '123456',
      last4: '7890',
      expiration_date: '122022',
      status: 'declined'
    }]
  })

  t.deepEqual(antifraudData, expectedData)
});
