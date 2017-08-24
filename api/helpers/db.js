let MongoClient = require('mongodb').MongoClient
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let config = require('../../config')
let Client = require('./clients').Client
let Account = require('./accounts').Account

// Clients

const normalizeClient = clientObj => {
  // Normalize DOB
  if (clientObj.dob){
    clientObj.dob = new Date(clientObj.dob).toJSON()
  }

  // Normalize Phone Number
  if (clientObj.phone){
    let phoneNumber = phoneUtil.parse(clientObj.phone, 'US')
    clientObj.phone = phoneUtil.format(phoneNumber, PNF.INTERNATIONAL)
  }

  return clientObj
}

const getClients = () => {
  return Client.find().then(clients => {
    return clients
  })
}

const getClientById = clientId => {
  return Client.findOne({ _id: clientId })
}

const insertClient = clientObj => {
  clientObj = normalizeClient(clientObj)

  let client = new Client(clientObj)
  return client.save()
}

const updateClientById = (clientId, clientObj) => {
  clientObj = normalizeClient(clientObj)
  return Client.findOneAndUpdate({ _id: clientId }, clientObj)
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

const getAccountsByClientId = clientId => {
  return Client.findOne({ _id: clientId }).then(client => {
    return client.accounts
  })
}

const insertAccountByClientId = (clientId, accountObj) => {
  return Client.findOne({ _id: clientId }).then(client => {
    client.accounts.push(accountObj)
    return client.save()
  })
}

module.exports = {
  getClients,
  getClientById,
  insertClient,
  updateClientById,
  deleteClientById,
  getAccounts,
  getAccountsByClientId,
  insertAccountByClientId
}
