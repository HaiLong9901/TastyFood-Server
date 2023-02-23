const express = require('express')
const VoucherController = require('../controllers/VoucherController')
const verifyAdminRole = require('../middlewares/authAdmin')
const router = express.Router()

router.post('/create_voucher', verifyAdminRole, VoucherController.createVoucher)
router.get('/get_by_id/:id', VoucherController.getVoucherById)
router.get('/get_by_code/:code', VoucherController.getVoucherByCode)
router.get('/get_all', VoucherController.getAllVouchers)
router.put('/remove_voucher', verifyAdminRole, VoucherController.removeVoucher)

module.exports = router
