const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const connectDB = (url) => {
  
  mongoose.set('strictQuery', true); // Suppress strictQuery warning
  return mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,   
  });
};

module.exports = connectDB;
