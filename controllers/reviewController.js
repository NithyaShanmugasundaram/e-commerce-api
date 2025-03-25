const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermission } = require("../utils");

const createReview = async (req, res) => {
  try {
    const { product: productId } = req.body;

    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    // Check if user already submitted a review for this product
    const alreadySubmitted = await Review.findOne({
      product: productId,
      user: req.user.userId,
    });

    if (alreadySubmitted) {
      throw new CustomError.BadRequestError(
        "Already submitted review for this product"
      );
    }

    // Add user ID to request body
    req.body.user = req.user.userId;

    // Create the review
    const review = await Review.create(req.body);

    res.status(StatusCodes.CREATED).json({ review });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};
const getAllReviews = async (req, res) => {
  try {
    // Populate reviews with product and user details
    const reviews = await Review.find({})
      .populate({
        path: "product",
        select: "name company price",
      })
      .populate({
        path: "user",
        select: "name",
      });

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};
const getSingleReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const review = await Review.findById(reviewId)
      .populate({
        path: "product",
        select: "name company price",
      })
      .populate({
        path: "user",
        select: "name",
      });

    // if (!review) {
    //   throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    // }
    res.status(StatusCodes.OK).json({ review, reviewLength: review.length });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
};
const updateReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }

    // Update review
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    await review.save();

    res.status(StatusCodes.OK).json({ review });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};
const deleteReview = async (req, res) => {

  try {
    const { id: reviewId } = req.params;
    const review = await Review.findById(reviewId);
   
    if (!review) {
      throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    // Check permissions
    checkPermission(req.user, review.user);
    // Remove review
    await review.remove();
    res.status(StatusCodes.OK).json({ msg: "Review removed successfully" });
  } catch (error) {
   next(error)
  }
};
const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;

    // Check if product exists
    const productExists = await Product.findById(productId);

    if (!productExists) {
      throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    const reviews = await Review.find({ product: productId }).populate({
      path: "user",
      select: "name",
    });

    res.status(StatusCodes.OK).json({ reviews });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getProductReviews,
};
