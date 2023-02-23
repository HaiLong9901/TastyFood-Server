const express = require('express')
const Product = require('../models/Product')

const ProductController = {
  createProduct: async (req, res) => {
    const { name, original_price, sale_price, imageURL, desc, genre } = req.body
    if (!name || !original_price || !imageURL || !genre)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })

    try {
      let testExist = await Product.findOne({ name })
      if (testExist)
        return res.status(400).json({
          success: false,
          passage: 'This product has already existed',
        })

      const product = new Product({
        name,
        original_price,
        sale_price,
        imageURL,
        desc,
        genre,
      })

      await product.save()

      return res.json({
        success: true,
        passage: 'Create product successfully',
        product,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const results = await Product.find({ isSelling: true }).populate('genre').sort({ updatedAt: -1 }).exec()
      res.json({
        success: true,
        passage: 'Find all successfully',
        results,
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        success: false,
        passage: 'No products be found',
      })
    }
  },

  getProductById: async (req, res) => {
    try {
      const result = await Product.findById(req.params.id)
      return res.json({
        success: true,
        passage: 'Successfully',
        result,
      })
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        success: false,
        passage: 'No result is found',
      })
    }
  },

  updateProduct: async (req, res) => {
    const { name, original_price, sale_price, imageURL, desc, genre, id } = req.body
    if (!id)
      return res.status(400).json({
        success: false,
        passage: 'Missing product id',
      })
    try {
      let product = await Product.findById(id).exec()
      product.name = name
      product.desc = desc
      product.original_price = original_price
      product.sale_price = sale_price
      product.imageURL = imageURL
      product.genre = genre
      await product.save()
      return res.json({
        success: true,
        passage: 'Update product successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },

  deleteProduct: async (req, res) => {
    const { productId } = req.body
    try {
      let product = await Product.findById(productId).exec()
      product.isSelling = false
      await product.save()
      return res.json({
        success: true,
        passage: 'Delete product successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = ProductController
