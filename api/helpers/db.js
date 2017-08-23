let MongoClient = require('mongodb').MongoClient
let config = require('../../config')

const getClients = () => {
  return MongoClient.connect(config.DB_URL).then(db => {
    return db.collection('clients').find({}).toArray()
  })
}

const insertClient = clientObj => {
  return MongoClient.connect(config.DB_URL).then(db => {
    return db.collection('clients').insert(clientObj)
  })
}

module.exports = {
  getClients,
  insertClient
}
