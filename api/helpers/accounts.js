let mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
  number: Number,
  type: String,
  status: String
})

const Account = mongoose.model('Account', AccountSchema);

module.exports = {
  AccountSchema,
  Account
}
