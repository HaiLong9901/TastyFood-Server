const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: true,
    },
    review: {
      type: String,
    },
    rate: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('reviews', ReviewSchema)
