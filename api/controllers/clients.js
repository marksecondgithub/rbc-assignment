let db = require('../helpers/db')

const clientsList = (req, res) => {
  return db.getClients().then(clients => {
    return res.json(clients)
  }).catch(err => {
    res.status(500)
    res.end(err)
  })
}

const clientCreate = (req, res) => {
  return db.insertClient(req.body).then(() => {
    return res.json('')
  }).catch(err => {
    res.status(500)
    res.end(err)
  })
}

module.exports = {
  clientsList,
  clientCreate
}
