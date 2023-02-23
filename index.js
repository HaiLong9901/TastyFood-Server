require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const { ObjectId } = require('mongoose')
const AuthRouter = require('./routes/auth')
const ProductRouter = require('./routes/product')
const CartRouter = require('./routes/cart')
const OrderRouter = require('./routes/order')
const VoucherRouter = require('./routes/voucher')
const GenreRouter = require('./routes/genre')
const cors = require('cors')
const app = express()
app.use(express.json())

const connectDb = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://longdh9901:longdh9901@cluster0.uhqd5sb.mongodb.net/?retryWrites=true&w=majority',
    )
    console.log('mongodb connected')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
connectDb()

app.use(
  cors({
    credentials: true,
    origin: '*',
    optionsSuccessStatus: 200,
  }),
)
app.use('/api/auth', AuthRouter)
app.use('/api/product', ProductRouter)
app.use('/api/cart', CartRouter)
app.use('/api/order', OrderRouter)
app.use('/api/voucher', VoucherRouter)
app.use('/api/genre', GenreRouter)
app.get('/', (req, res) => res.send('Hello world'))

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server started on port ${port}`))
