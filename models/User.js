const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    address: {
      type: Array,
    },
    // address: [

    // ]
    credit: {
      type: String,
    },
    imageURL: {
      type: String,
      default: 'https://www.focusedu.org/wp-content/uploads/2018/12/circled-user-male-skin-type-1-2.png',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('users', UserSchema)
