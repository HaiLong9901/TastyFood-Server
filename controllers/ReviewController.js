const express = require('express')
const Review = require('../models/Review')
const Product = require('../models/Product')
const Order = require('../models/Order')

// const ReviewController = {
//     getProductsToReview: async (req, res) => {
//         const userId = req.userId
//         try {
//             const orders = await Order.find({userId, status: 'success'}).exec()
//             const reviews = await Review.find({userId}).exec()

//         } catch (error) {

//         }
//     }
// }
