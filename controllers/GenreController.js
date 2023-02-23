const express = require('express')
const Genre = require('../models/Genre')
const Product = require('../models/Product')

const GenreController = {
  getAllGenres: async (req, res) => {
    try {
      const genres = await Genre.find()
      return res.json({
        success: true,
        result: genres,
      })
    } catch (error) {
      console.log(error)
    }
  },

  createGenre: async (req, res) => {
    const { name } = req.body
    if (!name)
      return res.status(400).json({
        success: false,
        passage: 'Missing genre name',
      })
    try {
      const existedGenre = await Genre.findOne({ name })
      if (existedGenre)
        return res.status(400).json({
          success: false,
          passage: 'Genre already existed',
        })
      const genre = new Genre({
        name,
      })
      await genre.save()
      return res.json({
        success: true,
        passage: 'Create Genre successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },

  getProductsByGenre: async (req, res) => {
    const genreId = req.params.genreId
    if (!genreId)
      return res.status(400).json({
        success: false,
        passage: 'Missing genre Id',
      })
    try {
      const products = await Product.find({
        genre: genreId,
      })
      return res.json({
        success: true,
        result: products,
      })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = GenreController
