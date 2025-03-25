const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide rating']
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide review title'],
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Please provide review text'],
    maxlength: 500
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  }
}, { timestamps: true });
//User can leave 1 review for 1 individual product
//compound index
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.statics.calcAverageRating = async function (productId) {
  const result=await this.aggregate([
    {
      $match: {
        product: productId
      }
    }, {
      $group: {
        _id: productId, 
        averageRating: {
          $avg: '$rating'
        }, 
        numOfReviews: {
          $sum: 1
        },
        mostRated: {
          $max: '$rating'
        }
      }
    }
  ]);

  try {
    await this.model('Product').findOneAndUpdate(productId, {
      averageRating: Math.ceil(result[0]?.averageRating||0),
      numOfReviews: result[0]?.numOfReviews||0,
      mostRated: result[0]?.mostRated||0
    });
    
  } catch (error) {
    next(error)
  }
}
ReviewSchema.post('save', async function () {
 
  await this.constructor.calcAverageRating(this.product);
});
ReviewSchema.post('remove', async function () {
  await this.constructor.calcAverageRating(this.product);
});
module.exports = mongoose.model('Review', ReviewSchema);


