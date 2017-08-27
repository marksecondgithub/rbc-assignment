let mongoose = require('mongoose')
let AccountSchema = require('./accounts').AccountSchema

let ClientSchema = mongoose.Schema({
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
  dob: {
    type: Date,
    es_indexed: true,
    es_type: 'date'
  },
  accounts: [AccountSchema]
})

ClientSchema.index({ name: 'text' })

let Client = mongoose.model('Client', ClientSchema);

module.exports = {
  ClientSchema,
  Client
}
