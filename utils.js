
const CustomError= require('./errors');
const checkPermission=(user, userRequestId)=>{
    try {
        if(user.role ==="admin"){
            return true;
        }else if(user._id===userRequestId.toString()){
            return true;
        }else{
            throw new CustomError.UnauthorizedError("user is not autherticated")
        }
    } catch (error) {
        throw new CustomError.UnauthorizedError("user is not autherticated")
    }
   

}
module.exports={
    checkPermission
}