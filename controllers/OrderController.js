const express = require('express')
const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')
const _ = require('lodash')

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const OrderController = {
  createOrder: async (req, res) => {
    const { address, products, voucher, amount } = req.body
    if (!address || !products || !products.length || !amount)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const order = new Order({
        userId: req.userId,
        ...req.body,
      })

      await order.save()
      return res.json({
        success: true,
        passage: 'place order successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  rejectOrder: async (req, res) => {
    const { id } = req.body
    if (!id)
      return res.status(400).json({
        success: false,
        passage: 'Missing order id',
      })
    try {
      const order = await Order.findById(id).exec()
      order.status = 'rejected'
      await order.save()
      return res.json({
        success: true,
        passage: 'Reject order successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  getOrderById: async (req, res) => {
    const { orderId } = req.params.id
    if (!orderId)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })

    try {
      const order = await Order.find({
        _id: orderId,
        userId: req.userId,
      })
      return res.json({
        success: true,
        passage: 'get order by id successfully',
        result: order,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getAllOrders: async (req, res) => {
    const orderStatus = req.params.status
    try {
      if (!orderStatus || orderStatus === 'all') {
        const orders = await Order.find({ userId: req.userId })
          .populate({
            path: 'products',
            populate: {
              path: 'productId',
              select: ['name', 'imageURL', 'original_price', 'sale_price'],
            },
          })
          .sort({ updatedAt: -1 })
          .exec()
        return res.json({
          success: true,
          passage: 'Get all orders successfully',
          result: orders,
        })
      }
      const orders = await Order.find({ userId: req.userId, status: orderStatus })
        .populate({
          path: 'products',
          populate: {
            path: 'productId',
            select: ['name', 'imageURL', 'original_price', 'sale_price'],
          },
        })
        .sort({ updatedAt: -1 })
        .exec()
      return res.json({
        success: true,
        passage: `Get all orders with status ${orderStatus} successfully`,
        result: orders,
      })
    } catch (error) {
      console.log(error)
    }
  },

  updateStatus: async (req, res) => {
    const { orderId, status } = req.body
    if (!orderId)
      return res.status(400).json({
        success: false,
        passage: 'Missing order id',
      })
    try {
      let order = await Order.findById(orderId)
      if (!order)
        return res.status(400).json({
          success: false,
          passage: 'Order not found',
        })

      order.status = status
      await order.save()

      return res.json({
        success: true,
        passage: 'Update order status successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },

  getAllOrderByAdmin: async (req, res) => {
    const orderStatus = req.params.status
    try {
      if (!orderStatus || orderStatus === 'all') {
        const orders = await Order.find()
          .populate({
            path: 'products',
            populate: {
              path: 'productId',
              select: ['name'],
            },
          })
          .populate('userId', ['name', 'phone'])
          .sort({ updatedAt: -1 })
          .exec()
        return res.json({
          success: true,
          result: orders,
        })
      }
      const orders = await Order.find({ status: orderStatus })
        .populate({
          path: 'products',
          populate: {
            path: 'productId',
            select: ['name'],
          },
        })
        .populate('userId', ['name', 'phone'])
        .sort({ updatedAt: -1 })
        .exec()
      return res.json({
        success: true,
        result: orders,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getDetailOrderAdmin: async (req, res) => {
    const orderId = req.params.orderId
    if (!orderId)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const order = await Order.findById(orderId)
        .populate('userId', ['name', 'phone'])
        .populate({
          path: 'products',
          populate: {
            path: 'productId',
            select: ['name', 'original_price', 'sale_price'],
          },
        })
        .populate('voucher', ['code', 'value'])
        .exec()
      return res.json({
        success: true,
        result: order,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getStatisticSales: async (req, res) => {
    const { type } = req.params
    if (!type)
      return res.status(400).json({
        success: false,
        passage: 'Missing type of statistic',
      })
    try {
      let sales = []
      if (type === 'day') {
        const today = new Date()
        const lastDay = new Date()
        lastDay.setDate(today.getDate() - 6)
        const orders = await Order.find({
          createdAt: {
            $gte: new Date(lastDay.toISOString().substring(0, 10)),
            $lte: today,
          },
          status: 'success',
        })
        for (let i = 0; i < 7; ++i) {
          const date = new Date()
          date.setDate(today.getDate() - i)
          const amount = orders.reduce((total, order) => {
            if (new Date(order.createdAt).toDateString() === date.toDateString()) return total + order.amount
            return total + 0
          }, 0)
          sales.push({
            date,
            amount,
          })
        }
      } else if (type === 'month') {
        const date = new Date()
        const firstDate = new Date(`${date.getFullYear()}-01-01`)
        const lastDate = new Date(`${parseInt(date.getFullYear()) + 1}-01-01`)
        const orders = await Order.find({
          createdAt: {
            $gte: firstDate,
            $lt: lastDate,
          },
          status: 'success',
        })
        for (let i = 0; i < 12; ++i) {
          const amount = orders.reduce((total, order) => {
            if (new Date(order.createdAt).getMonth() === i) {
              return (total += order.amount)
            }
            return total
          }, 0)
          sales.push({
            date: months[i],
            amount,
          })
        }
      }

      res.json({
        success: true,
        result: type === 'day' ? sales.reverse() : sales,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getStatisticOrders: async (req, res) => {
    const { type } = req.params
    if (!type)
      return res.status(400).json({
        success: false,
        passage: 'Missing type of statistic',
      })
    try {
      let sales = []
      if (type === 'day') {
        const today = new Date(Date.now())
        const lastDay = new Date()
        lastDay.setDate(today.getDate() - 6)
        const orders = await Order.find({
          createdAt: {
            $gte: new Date(lastDay.setHours(0, 0, 0, 0)),
            $lte: today,
          },
        })

        for (let i = 0; i < 7; ++i) {
          const date = new Date()
          date.setDate(today.getDate() - i)
          date.setHours(0, 0, 0, 0)
          const success = orders.reduce((total, order) => {
            if (new Date(order.createdAt).toDateString() === date.toDateString() && order.status === 'success')
              return total + 1
            return total
          }, 0)
          const rejected = orders.reduce((total, order) => {
            if (new Date(order.createdAt).toDateString() === date.toDateString() && order.status === 'rejected')
              return total + 1
            return total
          }, 0)
          sales.push({
            date,
            success,
            rejected,
          })
        }
      } else if (type === 'month') {
        const months = [
          'Tháng 1',
          'Tháng 2',
          'Tháng 3',
          'Tháng 4',
          'Tháng 5',
          'Tháng 6',
          'Tháng 7',
          'Tháng 8',
          'Tháng 9',
          'Tháng 10',
          'Tháng 11',
          'Tháng 12',
        ]
        const date = new Date()
        const firstDate = new Date(`${date.getFullYear()}-01-01`)
        const lastDate = new Date(`${parseInt(date.getFullYear()) + 1}-01-01`)
        const orders = await Order.find({
          createdAt: {
            $gte: firstDate,
            $lt: lastDate,
          },
        })
        for (let i = 0; i < 12; ++i) {
          const success = orders.reduce((total, order) => {
            if (new Date(order.createdAt).getMonth() === i && order.status === 'success') {
              return total + 1
            }
            return total
          }, 0)
          const rejected = orders.reduce((total, order) => {
            if (new Date(order.createdAt).getMonth() === i && order.status === 'rejected') {
              return total + 1
            }
            return total
          }, 0)
          sales.push({
            date: months[i],
            success,
            rejected,
          })
        }
      }

      res.json({
        success: true,
        result: type === 'day' ? sales.reverse() : sales,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getStatisticProducts: async (req, res) => {
    const { type } = req.params
    const today = new Date()
    if (!type)
      return res.status(400).json({
        success: false,
        passage: 'Missing type of statistic',
      })
    try {
      let result
      const products = await Product.find()
      if (type === 'day') {
        const orders = await Order.find({
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0),
            $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
          },
          status: 'success',
        })
        result = products.map((product) => {
          const amount = orders.reduce((total, order) => {
            order.products.forEach((prd) => {
              if (product._id.equals(prd.productId)) {
                console.log('yes')
                total += prd.quantity
              }
            })
            return total
          }, 0)
          return { product, amount }
        })
      } else if (type === 'month') {
        const orders = await Order.find({
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0),
            $lte: today,
          },
          status: 'success',
        })
        result = products.map((product) => {
          const amount = orders.reduce((total, order) => {
            order.products.forEach((prd) => {
              if (product._id.equals(prd.productId)) {
                total += prd.quantity
              }
            })
            return total
          }, 0)
          return { product, amount }
        })
      } else {
        return res.status(400).json({
          success: false,
          passage: 'type didnot exist',
        })
      }
      result = result.sort((product1, product2) => product2.amount - product1.amount)
      // result.length = 5
      res.json({
        success: true,
        result,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getDailySatistic: async (req, res) => {
    try {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const ordersYesterday = await Order.find({
        createdAt: {
          $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0),
        },
        status: 'success',
      })
      const ordersToday = await Order.find({
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0),
        },
        status: 'success',
      })
      const amountYesterday = ordersYesterday.reduce((total, order) => total + order.amount, 0)
      const amountToday = ordersToday.reduce((total, order) => total + order.amount, 0)
      const userToday = await User.find({
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0),
        },
        isAdmin: false,
      })
      const userYesterday = await User.find({
        createdAt: {
          $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0),
        },
        isAdmin: false,
      })
      return res.json({
        success: true,
        result: {
          amount: {
            amountToday,
            amountYesterday,
          },
          orderQuantity: {
            today: ordersToday.length,
            yesterday: ordersYesterday.length,
          },
          newUser: {
            today: userToday.length,
            yesterday: userYesterday.length,
          },
        },
      })
    } catch (error) {
      console.log(error)
    }
  },

  getMonthlySatistic: async (req, res) => {
    try {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const orders = await Order.find({
        createdAt: {
          $gte: new Date(`${today.getFullYear()}-${months[today.getMonth()]}-01T17:00:00Z`),
          $lte: today,
        },
      })
      const successOrder = orders.reduce((total, order) => {
        if (order.status === 'success') return total + 1
        return total
      }, 0)
      const rejectedOrder = orders.reduce((total, order) => {
        if (order.status === 'rejected') return total + 1
        return total
      }, 0)
      const shippingOrder = orders.reduce((total, order) => {
        if (order.status === 'shipping') return total + 1
        return total
      }, 0)
      const pendingOrder = orders.reduce((total, order) => {
        if (order.status === 'pending') return total + 1
        return total
      }, 0)
      return res.json({
        success: true,
        result: {
          successOrder,
          rejectedOrder,
          shippingOrder,
          pendingOrder,
        },
      })
    } catch (error) {}
  },

  getSaleReportExcelByDate: async (req, res) => {
    const { date } = req.params
    if (!date)
      return res.status(400).json({
        success: false,
        passage: 'missing date',
      })
    let arrOrder = []
    try {
      const now = new Date(date)
      const orders = await Order.find({
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
          $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
        },
      })
        .populate('userId', ['name'])
        .exec()
      arrOrder = orders.map((order) => {
        return [order._id, order.userId.name, order.amount]
      })
      return res.json({
        success: true,
        result: arrOrder,
      })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = OrderController
