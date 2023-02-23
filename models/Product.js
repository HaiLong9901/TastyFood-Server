const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    original_price: {
      type: Number,
      required: true,
    },
    sale_price: {
      type: Number,
    },
    imageURL: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: 'genre',
      required: true,
    },
    isSelling: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('products', ProductSchema)
