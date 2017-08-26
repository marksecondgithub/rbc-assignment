let db = require('../helpers/db')
let PNF = require('google-libphonenumber').PhoneNumberFormat
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
let moment = require('moment')
let Client = require('../helpers/clients').Client

const clientsList = (req, res) => {
  return db.getClients().then(clients => {
    return res.json(clients)
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const clientFind = (req, res) => {
  let params = req.swagger.params
  let paramsCount = 0
  Object.keys(params).forEach(param => {
    paramsCount += params[param].value !== undefined ? 1 : 0
  })
  if (paramsCount !== 1){
    res.status(400)
    return res.json({err: "Must send exactly one query param (account, phone, email)"})
  }
  Object.keys(params).forEach(param => {
    if (params[param].value !== undefined){
      return db.getClientBy(param, params[param].value).then(client => {
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
  })
  if (params.email.value !== undefined){
    return db.getClientBy('email', params.email.value)
  }
}

const clientSearch = (req, res) => {
  let params = req.swagger.params
  let query = {
    bool: {
      must: []
    }
  }
  if (params.name.value){
    query.bool.must.push({match: {name: params.name.value}})
  }
  if (params.minAge.value || params.maxAge.value){
    let rangeClause = { range: { dob: {} } }
    if (params.maxAge.value){
      let minDate = new moment().subtract(params.maxAge.value + 1, 'years').add(1, 'days').toDate()
      rangeClause.range.dob.from = minDate
    }
    if (params.minAge.value){
      let maxDate = new moment().subtract(params.minAge.value, 'years').toDate()
      rangeClause.range.dob.to = maxDate
    }
    query.bool.must.push(rangeClause)
  }
  Client.search(query, {hydrate: true}, (err, clients) => {
    return res.json(clients.hits.hits)
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
  clientFind,
  clientSearch,
  clientById,
  clientCreate,
  clientUpdate,
  clientDelete
}
