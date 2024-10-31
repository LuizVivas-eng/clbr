const express = require('express')
const app = express()
const db = require('./config/db')
const parseapi = require('./config/parse-serve')
const consign = require('consign')

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.db = db
app.parseapi = parseapi

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend executando na porta ${PORT}...`);
});