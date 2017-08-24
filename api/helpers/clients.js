let mongoose = require('mongoose')
let AccountSchema = require('./accounts').AccountSchema

const ClientSchema = mongoose.Schema({
  name: String,
  address: String,
  postalCode: String,
  phone: String,
  email: String,
  dob: String,
  accounts: [AccountSchema]
})

const Client = mongoose.model('Client', ClientSchema);

module.exports = {
  ClientSchema,
  Client
}
