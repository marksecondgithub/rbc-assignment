let MongoClient = require('mongodb').MongoClient
let mongoose = require('mongoose')
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let config = require('../../config')


const clientSchema = mongoose.Schema({
  name: String,
  address: String,
  postalCode: String,
  phone: String,
  email: String,
  dob: String
})

const Client = mongoose.model('Client', clientSchema);

const getClients = () => {
  return Client.find().then(clients => {
    return clients
  })
}

const insertClient = clientObj => {
  // Normalize DOB
  clientObj.dob = new Date(clientObj.dob).toJSON()

  // Normalize Phone Number
  let phoneNumber = phoneUtil.parse(clientObj.phone, 'US')
  clientObj.phone = phoneUtil.format(phoneNumber, PNF.INTERNATIONAL)

  let client = new Client(clientObj)
  return client.save()
}

module.exports = {
  getClients,
  insertClient
}
