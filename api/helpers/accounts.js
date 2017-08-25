let mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
  number: {
    type: Number,
    unique: true,
    sparse: true
  },
  type: String,
  status: String
})

module.exports = {
  AccountSchema
}
