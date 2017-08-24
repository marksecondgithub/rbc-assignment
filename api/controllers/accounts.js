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

module.exports = {
  accountsList,
  accountsListByClientId,
  accountCreate
}
