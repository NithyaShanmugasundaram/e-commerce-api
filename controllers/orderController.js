const CustomError  = require('../errors');
const Order = require('../models/Order');
const {StatusCodes} = require('http-status-codes');
const Product = require('../models/Product');
const Review=require('../models/Review');

const getAllOrders=async(req,res,next)=>{
    try {
        const orders=await Order.find();
        if(!orders){
           throw new CustomError.NotFoundError("No orders found")
        }
        res.status(StatusCodes.OK).json({orders,count:orders.length})
    } catch (error) {
        next(error)
    }
}
const getSingleOrder=async(req,res,next)=>{
    const {id:orderId}=req.params;
    try {
        const order= await Order.findById(orderId);
        if(!order){
            throw new CustomError.NotFoundError(`No order with id: ${orderId}`)
        }
        res.status(StatusCodes.OK).json({order})
    } catch (error) {
        next(error)
    }
}
const createOrder=async(req,res,next)=>{
    const {tax,shippingFee,items,shippingAddress}=req.body;
    const{userId}=req.user;
   try {
    if(!items || items.length < 1){
        throw new CustomError.BadRequestError("No items in the order")
    }
    if(!shippingAddress||!shippingAddress.address||!shippingAddress.city||!shippingAddress.postalCode||!shippingAddress.country||!shippingFee||!tax){
        throw new CustomError.BadRequestError("Required fields are missing")
    }
    let orderItems=[];
    let subtotal=0;
    for (const item of items) {
        const product=await Product.findById(item.product);
        if(!product){
            throw new CustomError.BadRequestError(`No product with id: ${item.product}`)
        }
        const {name,price,image,_id}=product;
        const singleCartItem={
            name,
            price,
            image,
            amount:item.amount,
            product:_id
        }
        //add single cart item to order
        orderItems.push(singleCartItem)
        //calculate subtotal
        subtotal=subtotal+(price*item.amount);
        
    }
    const total= subtotal+tax+shippingFee;
    //get client secret from stripe\
    const paymentIntent={clientSecret:"random text"};
   
    const{clientSecret}=paymentIntent;
    const order =await Order.create({tax,shippingFee,orderItems,subtotal,shippingAddress,total,clientSecret,user:userId});
    res.status(StatusCodes.CREATED).json({order,clientSecret:clientSecret})
   } catch (error) {
    next(error)
   }
}
const updateOrder=async(req,res,next)=>{
    const {id:orderId}=req.params;
    const {paymentIntentId}=req.body;
    try {
        const order=await Order.findById(orderId);
        if(!order){
            throw new CustomError.NotFoundError(`No order with id: ${orderId}`)
        }
       order.paymentIntentId=paymentIntentId;
       order.status="paid";
        await order.save();    
        res.status(StatusCodes.OK).json({msg:"order updated successfully"})
    
    } catch (error) {
        next(error)
    }

}
const getCurrentUserOrders=async(req,res,next)=>{
    const {user}=req;
    try {
        const orders=await Order.findById({user:user._id});
        if(!orders){
            throw new CustomError.NotFoundError("No orders found")
        }
        res.status(StatusCodes.OK).json({orders})
    } catch (error) {
        next(error)
    }
}


module.exports={
    getAllOrders,
    getSingleOrder,
    createOrder,
    updateOrder,
    getCurrentUserOrders

}