let mongoose = require('mongoose')
let AccountSchema = require('./accounts').AccountSchema

const ClientSchema = mongoose.Schema({
  name: String,
  address: String,
  postalCode: String,
  phone: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  dob: String,
  accounts: [AccountSchema]
})

const Client = mongoose.model('Client', ClientSchema);

module.exports = {
  ClientSchema,
  Client
}
