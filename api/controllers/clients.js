let db = require('../helpers/db')

const clientsList = (req, res) => {
  return db.getClients().then(clients => {
    return res.json(clients)
  }).catch(err => {
    res.status(500)
    return res.json({err})
  })
}

const clientCreate = (req, res) => {
  // Validate date string
  if (isNaN(Date.parse(req.body.dob))){
    res.status(500)
    let err = 'Invalid Date Format for DOB'
    return res.json({err})
  }
  return db.insertClient(req.body).then(() => {
    return res.json('')
  }).catch(err => {
    res.status(500)
    return res.json({err})
  })
}

module.exports = {
  clientsList,
  clientCreate
}
