const express = require('express')
const Voucher = require('../models/Voucher')
const _ = require('lodash')

const VoucherController = {
  createVoucher: async (req, res) => {
    const { code, value, expiredOn, apply_for, startOn } = req.body
    if (!code || !value || !expiredOn)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const today = new Date()
      const existedVoucher = await Voucher.findOne({
        code: code.toUpperCase(),
        startOn: {
          $lte: today,
        },
        expiredOn: {
          $gte: today,
        },
      }).exec()
      if (existedVoucher)
        return res.status(400).json({
          success: false,
          passage: 'Voucher has already existed',
        })
      const newVoucher = new Voucher({
        code: code.toUpperCase(),
        value,
        expiredOn,
        apply_for,
        startOn,
      })
      await newVoucher.save()
      return res.json({
        success: true,
        passage: 'Create voucher successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },

  getVoucherById: async (req, res) => {
    const id = req.params.id
    if (!id)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const voucher = await Voucher.findById(id).exec()
      if (!voucher)
        return res.status(400).json({
          success: false,
          passage: 'Voucher is not found',
        })
      return res.json({
        success: true,
        result: voucher,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getVoucherByCode: async (req, res) => {
    const code = req.params.code
    if (!code)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const voucher = await Voucher.find({ code }).exec()
      if (!voucher)
        return res.status(400).json({
          success: false,
          passage: 'Voucher is not found',
        })
      return res.json({
        success: true,
        result: voucher,
      })
    } catch (error) {
      console.log(error)
    }
  },

  getAllVouchers: async (req, res) => {
    try {
      const today = new Date()
      console.log(today)
      const voucher = await Voucher.find({
        startOn: {
          $lte: today,
        },
        expiredOn: {
          $gte: today,
        },
      })
      res.json({
        success: true,
        result: voucher,
      })
    } catch (error) {
      console.log(error)
    }
  },
  removeVoucher: async (req, res) => {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({
        success: false,
        passage: 'Missing voucher id',
      })
    }
    try {
      const voucher = await Voucher.findById(id).exec()
      voucher.expiredOn = new Date().setDate(new Date(voucher.startOn).getDate() - 1)
      await voucher.save()
      return res.json({
        success: true,
        passage: 'remove voucher successfully',
      })
    } catch (error) {}
  },
}

module.exports = VoucherController
