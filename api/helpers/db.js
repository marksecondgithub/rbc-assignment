let MongoClient = require('mongodb').MongoClient
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let config = require('../../config')
let Client = require('./clients').Client
let Account = require('./accounts').Account

// Clients

const getClients = () => {
  return Client.find().then(clients => {
    return clients
  })
}

const getClientById = clientId => {
  return Client.findOne({ _id: clientId })
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

const deleteClientById = clientId => {
  return Client.deleteOne({ _id: clientId })
}

// Accounts

const getAccounts = () => {
  return Account.find().then(accounts => {
    return accounts
  })
}

module.exports = {
  getClients,
  getClientById,
  insertClient,
  deleteClientById,
  getAccounts
}
