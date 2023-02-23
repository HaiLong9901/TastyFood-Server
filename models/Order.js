const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'products',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    voucher: {
      type: Schema.Types.ObjectId,
      ref: 'vouchers',
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'success', 'rejected', 'shipping'],
    },
    address: {
      type: Object,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('order', OrderSchema)
