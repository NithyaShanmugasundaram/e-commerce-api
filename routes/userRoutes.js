const express=require('express')
const router=express.Router()
const { authentication,authroizePermission } = require('../middleware/authentication');
const {getAllUsers,getSingleUser,showCurrentUser,updateUserPassword,updateUser, deleteAllUsers, deleteUser}=require('../controllers/userController');

//Autherntication controllers
router.route('/').get(authentication,authroizePermission('admin','user'),getAllUsers);
router.route('/me').get(authentication,showCurrentUser);
router.route('/updateUserPassword').patch(authentication,updateUserPassword);
router.route('/updateUser').patch(authentication,updateUser)
router.route('/deleteAllUsers').delete(authentication,deleteAllUsers)
router.route('/deleteUser').delete(authentication,authroizePermission('admin'),deleteUser)
router.route('/:id').get(authentication,getSingleUser);
module.exports=router
