'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
let mongoose = require('mongoose')
let cache = require('apicache').middleware
let _config = require('./config')
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

mongoose.connect(_config.DB_URL, { useMongoClient: true }).then(db => {
  SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }

    // Very basic in-memory caching
    app.get('/clients/search', cache('5 minutes'))
    app.get('/accounts', cache('5 minutes'))
    swaggerExpress.register(app);


    var port = process.env.PORT || 10010;
    app.listen(port);
  })
})
