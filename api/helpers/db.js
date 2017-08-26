let MongoClient = require('mongodb').MongoClient
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let randomInt = require('random-int')
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

const getClientBy = (param, value) => {
  if (param === 'email'){
    return Client.findOne({email: value})
  } else if (param === 'phone'){
    let phoneNumber = phoneUtil.parse(String(value), 'US')
    value = phoneUtil.format(phoneNumber, PNF.INTERNATIONAL)
    return Client.findOne({phone: value})
  } else if (param === 'account'){
    return Client.findOne({'accounts.number': value})
  }
}

const getClientById = clientId => {
  return Client.findOne({ _id: clientId })
}

const insertClient = clientObj => {
  clientObj = normalizeClient(clientObj)

  if (clientObj.accounts){
    // Randomly assign 10-digit account number
    clientObj.accounts.map(account => {
      account.number = randomInt(1000000000, 9999999999)
      return account
    })
  }

  let client = new Client(clientObj)
  return client.save().catch(err => {
    // In rare case of duplicate key collision, try new account numbers
    if (err.code === 11000){ // Duplicate key code
      return insertClient(clientObj)
    }
  })
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
    accountObj.number = randomInt(1000000000, 9999999999)
    client.accounts.push(accountObj)
    return client.save().catch(err => {
      if (err.code === 11000){ // Duplicate key code
        return insertAccountByClientId(clientId, accountObj)
      }
    })
  })
}

const getAccountById = (clientId, accountId) => {
  return Client.findOne({ _id: clientId }).then(client => {
    if (!client){
      return null
    }
    return client.accounts.id(accountId)
  })
}

const updateAccountById = (clientId, accountId, accountObj) => {
  let updateObj = {}
  Object.keys(accountObj).forEach(key => {
    updateObj[`accounts.$.${key}`] = accountObj[key]
  })
  return Client.findOneAndUpdate({_id: clientId, "accounts._id": accountId},
    { "$set": updateObj }
  )
}

const deleteAccountById = (clientId, accountId) => {
  return Client.findOne({ _id: clientId }).then(client => {
    if (!client){
      return null
    }
    let account = client.accounts.id(accountId)
    if (!account){
      return null
    }
    account.remove()
    return client.save()
  })
}

module.exports = {
  getClients,
  getClientBy,
  getClientById,
  insertClient,
  updateClientById,
  deleteClientById,
  getAccounts,
  getAccountsByClientId,
  insertAccountByClientId,
  getAccountById,
  updateAccountById,
  deleteAccountById
}
