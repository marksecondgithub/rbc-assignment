let MongoClient = require('mongodb').MongoClient
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let config = require('../../config')

const getClients = () => {
  return MongoClient.connect(config.DB_URL).then(db => {
    return db.collection('clients').find({}).toArray()
  })
}

const insertClient = clientObj => {
  // Normalize DOB
  clientObj.dob = new Date(clientObj.dob).toJSON()

  // Normalize Phone Number
  let phoneNumber = phoneUtil.parse(clientObj.phone, 'US')
  clientObj.phone = phoneUtil.format(phoneNumber, PNF.INTERNATIONAL)

  return MongoClient.connect(config.DB_URL).then(db => {
    return db.collection('clients').insert(clientObj)
  })
}

module.exports = {
  getClients,
  insertClient
}
