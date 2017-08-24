let db = require('../helpers/db')

const accountsList = (req, res) => {
  return db.getAccounts().then(accounts => {
    return res.json(accounts)
  }).catch(err => {
    res.status(500)
    return res.json({err})
  })
}

module.exports = {
  accountsList
}
