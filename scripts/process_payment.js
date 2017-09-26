const {Client} = require('pg');

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        const client = new Client(process.env.PROCESS_PAYMENT_DATABASE_URL);
        client.connect();
        client.query('select count(1) from payment_service.catalog_payments;', (err, res) => {
            console.log(err ? err.stack : res.rows[0].count)
            client.end();
            console.log(chunk);
        });
    }
});

//require 'json'
//require 'pg'
//
//message = JSON.parse(ARGF.read)
//pg_con = PG.connect(ENV['PROCESS_PAYMENT_DATABASE_URL'])
//
//puts message["id"]
//count = pg_con.exec("select count(1) from payment_service.catalog_payments")
//puts count[0]["count"]
//
