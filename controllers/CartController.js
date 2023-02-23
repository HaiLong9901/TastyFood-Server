const express = require('express')
const Cart = require('../models/Cart')
const User = require('../models/User')
const Product = require('../models/Product')
const _ = require('lodash')

const CartController = {
  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.userId })
        .populate({
          path: 'products',
          populate: {
            path: 'productId',
          },
        })
        .exec()
      if (!cart)
        return res.status(400).json({
          success: false,
          passage: 'Cart not found',
        })
      return res.json({
        success: true,
        cart,
      })
    } catch (error) {
      console.log(error)
    }
  },

  addToCart: async (req, res) => {
    const { productId, quantity } = req.body
    if (!productId || !quantity)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const product = await Product.findById(productId)
      if (!product)
        return res.status(400).json({
          success: false,
          passage: 'Product not found',
        })
      const cart = await Cart.findOne({ userId: req.userId })
      if (!cart)
        return res.status(400).json({
          success: false,
          passage: 'User not found',
        })
      const index = _.findIndex(cart.products, (product) => product.productId == productId)
      if (index > -1) {
        cart.products[index].quantity += parseInt(quantity)
      } else {
        cart.products = [
          ...cart.products,
          {
            productId,
            quantity,
          },
        ]
      }
      await cart.save()
      return res.json({
        success: true,
        passage: 'Add to cart successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  deleteItemFromCart: async (req, res) => {
    const { products } = req.body
    if (!products || !products.length)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const cart = await Cart.findOne({ userId: req.userId }).exec()
      // console.log()
      products.forEach(
        (productId) => (cart.products = [...cart.products.filter((product) => product.productId != productId)]),
      )

      // cart.products.forEach(product => pro)
      await cart.save()
      res.json({
        success: true,
        passage: 'delete product from cart successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = CartController
