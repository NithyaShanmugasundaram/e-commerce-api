// models/Order.js
const mongoose = require('mongoose');

const SingleOrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  tax: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  orderItems: [SingleOrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  paymentIntentId: {
    type: String
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);