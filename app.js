
const express = require('express'); 
const app = express();
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json())
//database
const connectDB = require('./db/connect.js');

//middleware
const notFoundMiddleware=require('./middleware/not-found')
const errorHandlerMiddleware=require('./middleware/error-handler');

//logger 3rd party middleware 
const morgan=require('morgan')
app.use(morgan('tiny')) 
//cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.JWT_SECRET))   

//routes
const authRouter=require('./routes/authRoutes.js');
const userRouter=require('./routes/userRoutes.js');
const productRouter=require('./routes/productRoutes.js');
const reviewRouter=require('./routes/reviewRoutes.js');
const orderRouter=require('./routes/orderRoutes.js');
const fileUpload = require('express-fileupload' );

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors=require('cors');
const ExpressMongoSanitize = require('express-mongo-sanitize');

app.get('/',(req,res)=>{
    res.send("e-commerce-api")
})
app.get('/api/v1/auth/test',(req,res)=>{
    res.send("cookie tesing route")
})
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/user',userRouter)
app.use('/api/v1/product',productRouter)
app.use('/api/v1/review',reviewRouter)
app.use('/api/v1/order',orderRouter)
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)
app.use(express.static('./public'));
app.use(fileUpload())
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(ExpressMongoSanitize());

const port=process.env.PORT || 3000;

const start = async () => {

  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();


