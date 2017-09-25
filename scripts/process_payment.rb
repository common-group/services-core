require 'json'
require 'pg'

message = JSON.parse(ARGF.read)
pg_con = PG.connect(ENV['PROCESS_PAYMENT_DATABASE_URL'])

puts message["id"]
count = pg_con.exec("select count(1) from payment_service.catalog_payments")
puts count[0]["count"]

