const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
// import { nanoid } from 'nanoid'
const e = require('express')
const { v4: uuidv4 } = require('uuid')
const Cart = require('../models/Cart')
// const { nanoid } = require('nanoid')

const UserControler = {
  register: async (req, res) => {
    const { phone, password, name, confirmPass } = req.body
    if (!phone || !password || !name || !confirmPass)
      return res.status(400).json({
        success: false,
        passage: 'Missing user information',
      })
    if (password !== confirmPass)
      return res.status(400).json({
        success: false,
        passage: 'confirmPassword is false',
      })
    try {
      let user = await User.findOne({ phone })
      if (user)
        return res.status(400).json({
          success: false,
          passage: 'user have already existed',
        })
      const hashPassword = await argon2.hash(password)
      let newUser = new User({
        ...req.body,
        name,
        phone,
        password: hashPassword,
      })
      let userCart = new Cart({
        userId: newUser._id,
      })
      await newUser.save()
      await userCart.save()

      //return AccessToken

      // const accessToken = jwt.sign(
      //   {
      //     userId: newUser._id,
      //   },
      //   process.env.ACCESS_TOKEN_SECRET,
      //   {
      //     expiresIn: '60s',
      //   },
      // )
      return res.json({
        success: true,
        passage: 'register successfully',
        // accessToken,
      })
    } catch (error) {
      console.log(error)
    }
  },

  login: async (req, res) => {
    const { phone, password } = req.body
    if (!phone || !password)
      return res.status(400).json({
        success: false,
        passage: 'Missing user information',
      })
    try {
      let user = await User.findOne({ phone })
      if (!user)
        return res.status(400).json({
          success: false,
          passage: 'Incorect phone number',
        })

      const validPassword = await argon2.verify(user.password, password)
      if (!validPassword)
        return res.status(400).json({
          success: false,
          passage: 'Incorect password',
        })

      const accessToken = jwt.sign(
        {
          userId: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        // {
        //   expiresIn: '15s',
        // },
      )
      return res.json({
        success: true,
        passage: 'login successfully',
        accessToken,
        // user: user._id,
        // isAdmin: user.isAdmin,
        user: {
          id: user._id,
          isAdmin: user.isAdmin,
          imageURL: user.imageURL,
        },
      })
    } catch (error) {
      console.log(error)
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.userId)
      if (!user)
        return res.status(400).json({
          success: false,
          passage: 'User didnt exist',
        })
      return res.json({
        success: true,
        result: user,
      })
    } catch (error) {
      console.log(error)
    }
  },

  updateInfo: async (req, res) => {
    try {
      const { name, imageURL } = req.body
      let updatedInfo
      if (!name && imageURL) updatedInfo = { imageURL }
      else if (name && !imageURL) updatedInfo = { name }
      else if (name && imageURL) updatedInfo = { name, imageURL }
      else
        return res.status(401).json({
          success: false,
          passage: 'No update',
        })
      // const postUpdateCondition = _id: req.params.id, user: req.userId
      updatedInfo = await User.findOneAndUpdate({ _id: req.userId }, updatedInfo, { new: true })
      return res.json({
        success: true,
        passage: 'updated successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  updateAddress: async (req, res) => {
    try {
      // return res.json(req.userId)
      const user = await User.findById(req.userId)
      if (!user)
        return res.status(400).json({
          success: false,
          passage: 'user not found',
        })
      const { address } = req.body
      if (!address)
        return res.status(400).json({
          success: false,
          passage: 'Missing address',
        })
      const newAddress = {
        address,
        id: uuidv4(),
      }
      const updateAddress = await User.findByIdAndUpdate(
        req.userId,
        { address: [...user.address, newAddress] },
        { new: true },
      )
      if (updateAddress)
        return res.json({
          success: true,
          passage: 'Address is updated',
        })
    } catch (error) {
      console.log(error)
    }
  },

  deleteAddress: async (req, res) => {
    try {
      // return res.json(req.userId)
      const user = await User.findById(req.userId)
      if (!user)
        return res.status(400).json({
          success: false,
          passage: 'user not found',
        })
      const { index } = req.body
      if (!index)
        return res.status(400).json({
          success: false,
          passage: 'Missing address',
        })
      const updateAddress = await User.findByIdAndUpdate(
        req.userId,
        { address: [...user.address.filter((a) => a.id !== index)] },
        { new: true },
      )
      if (updateAddress)
        return res.json({
          success: true,
          passage: 'Address is updated',
        })
    } catch (error) {
      console.log(error)
    }
  },

  changePassword: async (req, res) => {
    const { password, confirm, oldPass } = req.body
    if (password !== confirm)
      return res.status(400).json({
        success: false,
        passage: 'Xác nhận mật khẩu sai',
      })
    try {
      const user = await User.findById(req.userId)
      if (!user)
        return res.status(400).json({
          success: false,
          passage: 'invalid token',
        })
      const validPassword = await argon2.verify(user.password, oldPass)
      if (!validPassword)
        return res.status(400).json({
          success: false,
          passage: 'Nhập sai mật khẩu',
        })
      const hashPassword = await argon2.hash(password)
      const updatedPassword = await User.findByIdAndUpdate(
        req.userId,
        {
          password: hashPassword,
        },
        {
          new: true,
        },
      )
      if (updatedPassword)
        return res.json({
          success: true,
          passage: 'Change password successfully',
        })
    } catch (error) {
      console.log(error)
    }
  },

  getAdminList: async (req, res) => {
    try {
      const adminList = await User.find({
        isAdmin: true,
        isActive: true,
      }).sort({
        createdAt: -1,
      })
      return res.json({
        success: true,
        result: adminList,
      })
    } catch (error) {
      console.log(error)
    }
  },
  createAdminAccount: async (req, res) => {
    const { name, phone, password } = req.body
    if (!name || !phone || !password)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    try {
      const existedAccount = await User.findOne({ phone }).exec()
      if (existedAccount)
        return res.status(400).json({
          success: false,
          passage: 'Admin account has already existed',
        })
      const hashPassword = await argon2.hash(password)
      const account = new User({
        name,
        phone,
        password: hashPassword,
        isAdmin: true,
      })
      await account.save()
      return res.json({
        success: true,
        passage: 'Create admin account successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  deleteAdminAccount: async (req, res) => {
    const { id } = req.body
    if (!id)
      return res.status(400).json({
        success: false,
        passage: 'Missing id',
      })
    if (id === req.userId)
      return res.status(400).json({
        success: false,
        passage: "You can't delete your account by yourself",
      })
    try {
      const acc = await User.findById(id).exec()
      if (!acc)
        return res.status(400).json({
          success: false,
          passage: 'Admin account is not found',
        })
      acc.isActive = false
      await acc.save()
      return res.json({
        success: true,
        passage: 'Remove admin account successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  updateAdminAccount: async (req, res) => {
    const { name, password, confirm } = req.body
    if (!password || !confirm)
      return res.status(400).json({
        success: false,
        passage: 'Missing information',
      })
    if (password !== confirm)
      return res.status(400).json({
        success: false,
        passage: 'Confirm password is incorrect',
      })
    try {
      const acc = await User.findById(req.userId).exec()
      const hashPassword = await argon2.hash(password)
      acc.password = hashPassword
      if (name) acc.name = name
      await acc.save()
      return res.json({
        success: true,
        passage: 'Update password successfully',
      })
    } catch (error) {
      console.log(error)
    }
  },
  getAdminAccount: async (req, res) => {
    try {
      const acc = await User.findById(req.userId)
      return res.json({
        success: true,
        result: acc,
      })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = UserControler
