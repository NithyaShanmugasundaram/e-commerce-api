const express = require('express');
const router = express.Router();

// Import controllers
const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getProductReviews
} = require('../controllers/reviewController');

// Import middleware
const {authentication,authroizePermission} = require('../middleware/authentication');

// Public routes (no authentication required)
router.get('/', getAllReviews);
router.get('/:id', getSingleReview);


// Protected routes (authentication required)
router.use(authentication); // All routes below this will require authentication

// Create a new review - authenticated users only
router.post('/', authroizePermission('user','admin'), createReview);

// Update and Delete reviews - authenticated users (with permission check in controller)

router.route('/:id')
  .patch(authroizePermission('user','admin'),updateReview)
  .delete(authroizePermission('user','admin'),deleteReview);
router.get('/:id/getproductreview', getProductReviews);
module.exports = router;