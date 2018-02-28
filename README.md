# Payment Services API [![CircleCI](https://circleci.com/gh/common-group/payment-service-api.svg?style=svg)](https://circleci.com/gh/common-group/payment-service-api)
This repository handles with a several modules to:
- Payment processing
- Credit card processing
- Subscription scheduler


### How to install

- Clone it
- `npm install` on project folder

### Message structures

Payment process message:

```json
{
    "action": "process_payment",
    "id": "catalog_payment_uuid",
    "created_at": "2018-02-23T16:31:18.238164"
}
```

Credit card generation

```json
{
	"action": "generate_card",
    "id": "credit_card_uuid"
}
```

### How to execute

`GATEWAY_API_KEY='pagarmeapikey' DATABASE_URL='dburl' echo 'msg_structure' | ./main.js`

### How execute tests

`DATABASE_URL='test data base url with common strucutre' npm test`




