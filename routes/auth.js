// require('dotenv').config()
const express = require('express')
const router = express.Router()
const UserControler = require('../controllers/UserController')
const verifyToken = require('../middlewares/auth')
const verifyAdminRole = require('../middlewares/authAdmin')

// @route api/auth/register
// @desc register user
// @access Public
router.post('/register', UserControler.register)

router.post('/login', UserControler.login)
router.get('/get_user', verifyToken, UserControler.getUser)
router.put('/update', verifyToken, UserControler.updateInfo)
router.put('/update_address', verifyToken, UserControler.updateAddress)
router.put('/change_password', verifyToken, UserControler.changePassword)
router.put('/delete_address', verifyToken, UserControler.deleteAddress)
router.get('/getAdminList', verifyAdminRole, UserControler.getAdminList)
router.post('/create_admin_acc', verifyAdminRole, UserControler.createAdminAccount)
router.put('/remove_admin_acc', verifyAdminRole, UserControler.deleteAdminAccount)
router.put('/update_admin_acc', verifyAdminRole, UserControler.updateAdminAccount)
router.get('/get_admin_acc', verifyAdminRole, UserControler.getAdminAccount)

module.exports = router
