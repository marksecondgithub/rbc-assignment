let MongoClient = require('mongodb').MongoClient
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let randomInt = require('random-int')
let mongoose = require('mongoose')
let moment = require('moment')
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

const searchClients = (params) => {
  let query
  if (params.name.value){
    query = Client.find(
      { $text: { $search: params.name.value } },
      { score : { $meta: "textScore" } }
    ).sort({ score : { $meta : 'textScore' } })
  } else {
    query = Client.find()
  }
  if (params.minAge.value || params.maxAge.value){
    let dobClause = {}
    if (params.maxAge.value){
      let minDate = new moment().subtract(params.maxAge.value + 1, 'years').add(1, 'days').toDate()
      dobClause.$gte = minDate
    }
    if (params.minAge.value){
      let maxDate = new moment().subtract(params.minAge.value, 'years').toDate()
      dobClause.$lte = maxDate
    }
    query = query.and({dob: dobClause})
  }
  return query
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

const getAccounts = params => {
  return new Promise((resolve, reject) => {
    let matchClauses = {}
    params.forEach(param => {
      matchClauses[`accounts.${param.param}`] = param.value
    })
    Client.collection.aggregate({
      $match: matchClauses
    }, {
      $unwind: '$accounts'
    }, {
      $match: matchClauses
    }, {
      $project: {
        _id: '$accounts._id',
        number: '$accounts.number',
        type: '$accounts.type',
        status: '$accounts.status',
        clientId: '$_id'
      }
    }, (err, accounts) => {
      if (err){
        reject(err)
      }
      resolve(accounts)
    })
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
  searchClients,
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
