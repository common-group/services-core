# GET - /v1/projects/:PROJECT_ID/subscriptions

- Scoped/Platform:
    Project subscriptions

### example request - Platform/Scoped

```curl
curl -X GET https://api.comum.io/v1/projects/PROJECT_UUID/subscriptions\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json'
```

### example result

```json
[
   {
      "id":"c51eaff6-f681-41e0-ac01-75e424a4f12a",
      "project_id":"8cc09670-a313-4ab3-b24d-c3aff9c20cb3",
      "credit_card_id":"a21050dc-94e8-46ae-a734-980028632798",
      "paid_count":1,
      "total_paid":1000,
      "status":"active",
      "paid_at":"2018-07-12T03:12:18.647112",
      "next_charge_at":"2018-08-12T03:12:18.108804",
      "checkout_data":{  
         "amount":"1000",
         "customer":{  
            "name":"Branco e Preto Comunicações Ltda.",
            "email":"lorem@lorem.me",
            "phone":{  
               "ddd":"44",
               "ddi":"55",
               "number":"55666789"
            },
            "address":{  
               "city":"São Paulo",
               "state":"SP",
               "street":"Rua Lorem",
               "country":"Brasil",
               "zipcode":"12323-010",
               "neighborhood":"Vista nova",
               "complementary":"",
               "street_number":"123"
            },
            "document_number":"1111111111111"
         },
         "anonymous":false,
         "payment_method":"credit_card",
         "is_international":false,
         "credit_card_owner_document":"1111111111111"
      },
      "created_at":"2018-07-12T03:12:18.108804",
      "user_id":"12d31adc-d573-4fb7-81d4-799769380b4d",
      "reward_id":null,
      "amount":1000,
      "project_external_id":"47590",
      "reward_external_id":null,
      "user_external_id":"686573",
      "payment_method":"credit_card",
      "last_payment_id":"ffb31a22-0427-47a5-88e2-e32cdc6cd455",
      "last_paid_payment_id":"ffb31a22-0427-47a5-88e2-e32cdc6cd455",
      "last_paid_payment_created_at":"2018-07-12T03:12:18.108804",
      "user_email":"lorem@lorem.me",
      "search_index":"'12d31adc':17 '12d31adc-d573-4fb7-81d4-799769380b4d':16 '41e0':13 '4ab3':25 '4fb7':19 '54154649000196':9C '75e424a4f12a':15 '799769380b4d':21 '81d4':20 '8cc09670':23 '8cc09670-a313-4ab3-b24d-c3aff9c20cb3':22 'a313':24 'ac01':14 'b24d':26 'branc':4B 'c3aff9c20cb3':27 'c51eaff6':11 'c51eaff6-f681-41e0-ac01-75e424a4f12a':10 'comunicaco':7B 'croata@lorem.me':3B 'd573':18 'f681':12 'ltda':8B 'luis':2B 'pret':6B 'test':1A",
      "current_paid_subscription":{  
         "amount":1000,
         "card_id":"c494d301-90c0-470e-a837-a27fb5a0b804",
         "customer":{  
            "name":"Branco e Preto Comunicações Ltda.",
            "email":"lorem@lorem.com",
            "phone":{  
               "ddd":"44",
               "ddi":"55",
               "number":"55666789"
            },
            "address":{  
               "city":"São Paulo",
               "state":"SP",
               "street":"Rua Lorem",
               "country":"Brasil",
               "zipcode":"12323-010",
               "neighborhood":"Vista nova",
               "complementary":"",
               "street_number":"123"
            },
            "document_number":"54154649000196"
         },
         "anonymous":false,
         "save_card":false,
         "current_ip":"177.191.164.249",
         "payment_method":"credit_card",
         "is_international":false,
         "credit_card_owner_document":"54154649000196"
      },
      "current_reward_data":null,
      "current_reward_id":null,
      "last_payment_data":{  
         "id":"ffb31a22-0427-47a5-88e2-e32cdc6cd455",
         "status":"paid",
         "created_at":"2018-07-12T03:12:18.108804",
         "payment_method":"credit_card",
         "refused_at":null,
         "next_retry_at":null
      },
      "last_paid_payment_data":{  
         "id":"ffb31a22-0427-47a5-88e2-e32cdc6cd455",
         "status":"paid",
         "created_at":"2018-07-12T03:12:18.108804",
         "payment_method":"credit_card"
      },
      "last_payment_data_created_at":"2018-07-12T03:12:18.108804"
   }
]
```
