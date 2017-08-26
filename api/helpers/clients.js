let mongoose = require('mongoose')
let AccountSchema = require('./accounts').AccountSchema
let mongoosastic = require('mongoosastic')

const ClientSchema = mongoose.Schema({
  name: {
    type: String,
    es_indexed: true
  },
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
  dob: {
    type: Date,
    es_indexed: true,
    es_type: 'date'
  },
  accounts: [AccountSchema]
})

ClientSchema.plugin(mongoosastic)

let Client = mongoose.model('Client', ClientSchema);

module.exports = {
  ClientSchema,
  Client
}
