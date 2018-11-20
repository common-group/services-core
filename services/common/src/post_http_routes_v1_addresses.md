# POST - /v1/addresses

- Scoped/Platform:

    Create an address

### payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| address.external_id | string | **not required** | unique reference id |
| address.country_id | uuid | **required** | unique reference id |
| address.state_id | uuid | **required** | unique reference id |
| address.address_street | string | **required** | address street |
| address.address_number| string | **not required** | address number |
| address.address_complement | string | **not required** | address complement |
| address.address_neighbourhood| string | **not required** | address neighbourhood |
| address.address_city| string | **not required** | address city |
| address.address_zip_code | string | **not required** | address zip code |
| address.phone_number | string | **not required** | phone number associated with address |
| address.address_state | string | **not required** | state used for international addresses|


### example request - Platform/Scoped

```curl
curl -X POST https://api.comum.io/v1/addresses\
  -H 'Authorization: Bearer API_KEY' \
  -H 'content-type: application/json' \
  -d '{ 
	  "address": {
		   "external_id": "",
		   "country_id": "948c6d2c-cd46-4b0c-a26e-691eff5ba639",
		   "state_id": "4e9c2b8b-4960-4b48-9e68-3f69c150571f",
		   "address street":"my street"
	  }
  }'
```

### example result

```json
{
	"address_id": "ADDRESS_UUID",
}
```
