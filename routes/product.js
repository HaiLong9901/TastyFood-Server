const express = require('express')
const ProductController = require('../controllers/ProductController')
const router = express.Router()
const verifyAdminRole = require('../middlewares/authAdmin')

router.post('/create_product', verifyAdminRole, ProductController.createProduct)
router.get('/get_all_products', ProductController.getAllProducts)
router.get('/:id', ProductController.getProductById)
router.put('/update_product', verifyAdminRole, ProductController.updateProduct)
router.put('/delete_product', verifyAdminRole, ProductController.deleteProduct)

module.exports = router
