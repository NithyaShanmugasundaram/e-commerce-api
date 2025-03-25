// models/Product.js

const mongoose = require('mongoose');
const Review = require('./Review');


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        default: 0
    },
    image: {
        type: String,
        default: '/uploads/example.jpg'
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'Please provide company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} is not supported'
        }
    },
    colors: {
        type: [String],
        default: ['#222'],
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    mostRated: {
        type: Number,
        default: 0
    },
    topRated: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true,toJSON: { virtuals: true },  // Enable virtuals when document is converted to JSON
toObject: { virtuals: true }  });
// Virtual for reviews - this doesn't actually store data in the database
// but allows us to populate reviews related to this product
ProductSchema.virtual('reviews', {
    ref: 'Review',         // The model to use
    localField: '_id',     // Find reviews where `localField`
    foreignField: 'product', // is equal to `foreignField`
    justOne: false,
         // Give us an array of reviews, not just one
  });
  ProductSchema.pre('remove', async function(next) {
    await this.model('Review').deleteMany({ product: this._id });
    next();
  });

module.exports = mongoose.model('Product', ProductSchema);