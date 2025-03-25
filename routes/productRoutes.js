const express = require('express');
const router = express.Router();

// Import controllers
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require('../controllers/productController');

// Import middleware
const {authentication,authroizePermission} = require('../middleware/authentication');


// Public routes
router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);

// Protected routes - require authentication


// Create product - only admin can create
router.post('/', authentication, authroizePermission('admin','user'), createProduct);

// Update product - only admin or product owner can update
router.patch('/:id',authentication, updateProduct);

// Delete product - only admin or product owner can delete
router.delete('/:id',authentication, authroizePermission('admin'), deleteProduct);
//upload/update product image
router.post('/upload/:id', uploadProductImage);

module.exports = router;