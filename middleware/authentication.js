const CustomError = require("../errors");
const User = require("../models/User");
const jwt=require('jsonwebtoken')

const authentication=async(req,res,next)=>{

 
        try {
          const token = req.signedCookies.token;
        
          
          // Check if token exists
          if(!token){
            
            throw new CustomError.UnauthenticatedError("user is not authenticated");
          }
          
          try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const {userId, name, role} = decoded;
            
            // Find user in database
            const user = await User.findById(userId);
     
            
            if(!user){
              throw new CustomError.UnauthenticatedError("User not found");
            }
     // Attach user to request object
     req.user = {userId, name, role};
      
     next();
   } catch (error) {
     // Handle token verification errors
     throw new CustomError.UnauthenticatedError("Invalid authentication token");
   }
 } catch (error) {
   // Pass errors to Express error handler
   next(error);
 }
    }

const authroizePermission=(...roles)=>{

    return (req,res,next)=>{
        
        try {
            if(!roles.includes(req.user.role)){
                throw new CustomError.UnauthorizedError('User is not authroized for this route')
            }
            
        next()
        } catch (error) {
            next(error)
        }
    }

}
module.exports={
    authentication,
    authroizePermission
}