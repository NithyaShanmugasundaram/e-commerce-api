const Product = require('../models/Product.js');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermission } = require('../utils');


const createProduct = async (req, res) => {
  try {
    // Assign the user ID from req.user
    req.body.user = req.user.userId;
    
    // Create the product
    const product = await Product.create(req.body);
    
    res.status(StatusCodes.CREATED).json({ product });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};


const getAllProducts = async (req, res) => {
  try {
    // Define available filtering options
    const { name, category, company, featured, sort, fields } = req.query;
    
    const queryObject = {};
    
    // Apply filters
    if (name) {
      queryObject.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    
    if (category) {
      queryObject.category = category;
    }
    
    if (company) {
      queryObject.company = company;
    }
    
    if (featured) {
      queryObject.featured = featured === 'true';
    }
    
    // Build the query
    let result = Product.find(queryObject);
    
    // Apply sorting
    if (sort) {
      const sortList = sort.split(',').join(' ');
      result = result.sort(sortList);
    } else {
      result = result.sort('createdAt');
    }
    
    // Apply field limiting
    if (fields) {
      const fieldsList = fields.split(',').join(' ');
      result = result.select(fieldsList);
    }
    
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    result = result.skip(skip).limit(limit);
    
    // Execute query
    const products = await result.populate({path:'reviews'});
    
    res.status(StatusCodes.OK).json({ 
      products, 
      count: products.length,
      page,
      limit
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};


const getSingleProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    
    const product = await Product.findById(productId).populate({path:'reviews'})
   
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
    
    res.status(StatusCodes.OK).json({ product });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    

    const product = await Product.findById(productId);
   
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id: ${userId}`);
    }
    
    // Check if user has permission to update
    checkPermission(req.user, product.user);
    
    // Update product
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(StatusCodes.OK).json({ product: updatedProduct });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    
    const {id:productId}=req.params;
    const product = await Product.findById(productId);

    
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
    
    
    await product.remove();
    
    res.status(StatusCodes.OK).json({ msg: 'Product removed successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
}; 

const uploadProductImage = async (req, res,next) => {

  try {
    // Check if file exists in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new CustomError.BadRequestError('No file uploaded');
    }
    
    // Get the uploaded file
    const productImage = req.files.image;
    
    // Validate file type
    if (!productImage.mimetype.startsWith('image')) {
      throw new CustomError.BadRequestError('Please upload an image file');
    }
    
    // Validate file size
    const maxSize = 1024 * 1024; // 1MB
    if (productImage.size > maxSize) {
      throw new CustomError.BadRequestError('Image must be less than 1MB');
    }
    
    // Get product ID from request parameters
    const { id: productId } = req.params;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
   
    // Create filepath
   
    const filePath = path.join(__dirname, '../public/uploads/', productImage.name);
    
    // Move file to uploads directory
    await productImage.mv(filePath);
    
    // Update product with image path
    product.image = `/uploads/${productImage.name}`;
    await product.save();
    
    res.status(StatusCodes.OK).json({ 
      msg: 'Image uploaded successfully',
      image: `/uploads/${productImage.name}` 
    });
  } catch (error) {
   next(error)
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};