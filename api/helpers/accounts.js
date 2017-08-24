let mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
  number: {
    type: Number,
    unique: true
  },
  type: String,
  status: String
})

const Account = mongoose.model('Account', AccountSchema);

module.exports = {
  AccountSchema,
  Account
}
