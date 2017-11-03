#!/usr/local/bin/node
'use strict';

const express = require('express');
const {Client} = require('pg');
const pagarme = require('pagarme');
const _ = require('lodash');

const app = express();

// receive pagarme payment postbacks
app.post('/postbacks/pagarme', (req, res) => {
    console.log(req);
});

app.listen(process.env.PORT || 3000);
