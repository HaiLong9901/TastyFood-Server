const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyAdminRole = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      passage: 'Access token not found',
    })
  }
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decode.userId).exec()
    if (!user.isAdmin)
      return res.status(403).json({
        success: false,
        passage: 'Your account cannot access this page',
      })
    req.userId = decode.userId
    next()
  } catch (error) {
    console.log(error)
    return res.status(403).json({
      success: false,
      passage: 'Invalid token',
    })
  }
}

module.exports = verifyAdminRole
