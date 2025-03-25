const express = require('express');
const router = express.Router();

// Import controllers
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  getCurrentUserOrders
} = require('../controllers/orderController');

// Import middleware
const {authentication,authroizePermission} = require('../middleware/authentication');
// Protected routes (authentication required)
router.use(authentication); // All routes below this will require authentication
// Public routes (no authentication required)
router.get('/', authroizePermission('admin'),getAllOrders);
router.get('/:id', getSingleOrder);
router.post('/',  createOrder);
router.patch('/:id',updateOrder)
router.get('/showAllMyOrders', getCurrentUserOrders);
module.exports = router;