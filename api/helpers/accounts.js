let mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
  number: {
    type: Number,
    unique: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ['chequing', 'savings', 'investment']
  },
  status: {
    type: String,
    enum: ['active', 'inactive']
  },
})

module.exports = {
  AccountSchema
}
