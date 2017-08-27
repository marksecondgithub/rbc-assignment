let apicache = require('apicache')

const clearCache = (req, res) => {
  apicache.clear()
  return res.json('')
}

module.exports = {
  clearCache
}
