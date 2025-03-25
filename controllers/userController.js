const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt= require("jsonwebtoken");
const { checkPermission } = require("../utils.js");

const getAllUsers = async (req, res, next) => {

  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getSingleUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("products").populate("reviews");
    if (!user) {
      throw new CustomError.NotFoundError(`No user found with id: ${id}`);
    }
    checkPermission(user,id)
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
const showCurrentUser = async (req, res,next) => {
    try {
        res.status(StatusCodes.OK).json({ user: req.user });
    } catch (error) {
        next(error)
    }
 
};

const updateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new CustomError.CustomAPIError("Please provide all the fields!");
    }
    const { userId } = req.user;
    const user = await User.findById(userId);
    const verifyPassword = await user.comparePassword(oldPassword);
    if (!verifyPassword) {
      throw new CustomError.CustomAPIError("password is not matched.");
    }
    user.password = newPassword;
    await user.save();
    res
      .status(StatusCodes.OK)
      .json({ msg: "user password updated successfully" });
  } catch (error) {
    next(error);
  } 
};
const createUserToken=async(user)=>{
    const token = jwt.sign(
        { userId: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      return token;
}
const updateUser=async(req,res,next)=>{
   try {
    const {name,email}=req.body
    const{ userId}=req.user;
    if(!name||!email){
        throw new CustomError.CustomAPIError("Please provide all the required fields")
    }
    const user=await User.findOne({_id:userId});
    if(!user){
        throw new CustomError.NotFoundError("user not found");

    }
    user.name=name;
    user.email=email;
    await user.save();
    const newToken=await createUserToken(user);
    res.cookie("token", newToken, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
   res.status(StatusCodes.OK).json({user})
   } catch (error) {
    next(error)
   }
}
const deleteAllUsers=async(req,res,next)=>{
    try {
      const {userId}=req.user;
  
      const user= await User.findById(userId)

        if(!user){
            throw new CustomError.NotFoundError("user not found")
        }
        if(user.role === 'admin'){
        const result= await User.deleteMany({})
        res.status(StatusCodes.OK).json({msg:"Deleted all users successfully"})
        }else{
        res.status(StatusCodes.FORBIDDEN).json({msg:"User is not autrorized to do this operation"})
        }
       
    } catch (error) {
        next(error)
    }
  
}
const deleteUser=async(req,res,next)=>{
  
  try {
    const {userId}=req.user;
    
      const user= await User.findById(userId)
   
        if(!user){
            throw new CustomError.NotFoundError("user not found")
        }
      // if(user.role === 'admin'){
      // const result= await User.remove()
      // res.status(StatusCodes.OK).json({msg:"Deleted user successfully"})
      // }else{
      // res.status(StatusCodes.FORBIDDEN).json({msg:"User is not autrorized to do this operation"})
      // }
      await user.remove()
      res.status(StatusCodes.OK).json({msg:"Deleted user successfully"})
  } catch (error) {
      next(error)
  }

}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUserPassword,
  updateUser,
  deleteAllUsers,deleteUser
};
