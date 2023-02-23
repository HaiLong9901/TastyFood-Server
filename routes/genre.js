const express = require('express')
const router = express.Router()
const verifyAdminRole = require('../middlewares/authAdmin')
const GenreController = require('../controllers/GenreController')

router.get('/get_all', GenreController.getAllGenres)
router.get('/get_products/:genreId', GenreController.getProductsByGenre)
router.post('/create_genre', verifyAdminRole, GenreController.createGenre)

module.exports = router
