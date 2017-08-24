let db = require('../helpers/db')
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

const clientsList = (req, res) => {
  return db.getClients().then(clients => {
    return res.json(clients)
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const clientById = (req, res) => {
  return db.getClientById(req.swagger.params.clientId.value).then(client => {
    if (client){
      return res.json(client)
    } else {
      res.status(404)
      return res.json({err: "Client not found"})
    }
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const clientCreate = (req, res) => {
  // Validate date string
  if (isNaN(Date.parse(req.body.dob))){
    res.status(500)
    let err = 'Invalid Date Format for DOB'
    return res.json({err: err.message})
  }

  try {
    phoneUtil.parse(req.body.phone, 'US')
  } catch (err) {
    res.status(500)
    return res.json({err: err.message})
  }

  return db.insertClient(req.body).then(() => {
    res.status(201)
    return res.json('')
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const clientUpdate = (req, res) => {
  return db.updateClientById(req.swagger.params.clientId.value, req.body).then(client => {
    if (client){
      return res.json('')
    } else {
      res.status(404)
      return res.json({err: "Client not found"})
    }
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const clientDelete = (req, res) => {
  return db.deleteClientById(req.swagger.params.clientId.value).then(client => {
    if (client){
      return res.json('')
    } else {
      res.status(404)
      return res.json({err: "Client not found"})
    }
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

module.exports = {
  clientsList,
  clientById,
  clientCreate,
  clientUpdate,
  clientDelete
}
