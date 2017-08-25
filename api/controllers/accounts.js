let db = require('../helpers/db')

const accountsList = (req, res) => {
  return db.getAccounts().then(accounts => {
    return res.json(accounts)
  }).catch(err => {
    res.status(500)
    return res.json({err})
  })
}

const accountsListByClientId = (req, res) => {
  return db.getAccountsByClientId(req.swagger.params.clientId.value).then(accounts => {
    return res.json(accounts)
  }).catch(err => {
    res.status(500)
    return res.json({err})
  })
}

const accountCreate = (req, res) => {
  return db.insertAccountByClientId(req.swagger.params.clientId.value, req.body).then(() => {
    res.status(201)
    return res.json('')
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const accountById = (req, res) => {
  return db.getAccountById(req.swagger.params.clientId.value, req.swagger.params.accountId.value).then(account => {
    if (account){
      return res.json(account)
    } else {
      res.status(404)
      return res.json({err: "Account not found"})
    }
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const accountUpdate = (req, res) => {
  return db.updateAccountById(req.swagger.params.clientId.value, req.swagger.params.accountId.value, req.body).then(account => {
    if (account){
      return res.json('')
    } else {
      res.status(404)
      return res.json({err: "Account not found"})
    }
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

const accountDelete = (req, res) => {
  return db.deleteAccountById(req.swagger.params.clientId.value, req.swagger.params.accountId.value).then(client => {
    if (client){
      return res.json('')
    } else {
      res.status(404)
      return res.json({err: "Account not found"})
    }
  }).catch(err => {
    res.status(500)
    return res.json({err: err.message})
  })
}

module.exports = {
  accountsList,
  accountsListByClientId,
  accountCreate,
  accountById,
  accountUpdate,
  accountDelete
}
