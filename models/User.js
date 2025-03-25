const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
},{timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}});

UserSchema.pre('save',async function(){
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})
UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch=await bcrypt.compare(candidatePassword,this.password)
    return isMatch;
}
UserSchema.virtual('products',{
    ref:'Product',
    localField:'_id',
    foreignField:'user',
    justOne:false
})
UserSchema.virtual('reviews',{
    ref:'Review',
    localField:'_id',
    foreignField:'user',
    justOne:false
})
UserSchema.pre('remove',async function(){
    await this.model('Product').deleteMany({user:this._id})
    await this.model('Review').deleteMany({user:this._id})
})

module.exports = mongoose.model('User', UserSchema); 