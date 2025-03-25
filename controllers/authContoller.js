const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const jwt = require("jsonwebtoken");

const register = async (req, res,next) => {
  const { email, password, role, name } = req.body;
  try {
    if (!email || !name || !password) {
      throw new CustomError.BadRequestError(
        "Please provide all required fields"
      );
    }
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists");
    }
    // Set role - first user is admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "admin" : "user";

    const user = await User.create({ email, password, role, name });
    const userWithoutPassword = await User.findById(user._id).select(
      "-password"
    );
    //create jwt token
    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
    });

    res.status(StatusCodes.CREATED).json({ token, userWithoutPassword });
  } catch (error) {
    next(error);
    //res.status(StatusCodes.CREATED).json({ msg:"register catch error"});
  }
};
const login = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new CustomError.BadRequestError("email and password is missing");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.UnauthenticatedError("Invalid credentials");
    }
   // Compare password - use the method on the user instance
   const isPasswordCorrect = await user.comparePassword(password);
   if (!isPasswordCorrect) {
     throw new CustomError.UnauthenticatedError('Invalid credentials');
   }
   // Create token
   const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    // Return user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
    });
    res.status(StatusCodes.OK).json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error)
  }
 
};
const logout = async (req, res,next) => {
 try {
    res.clearCookie('token')
    res.status(StatusCodes.OK).json({msg:"user logout"})
 } catch (error) {
    next(error)
 }
};
module.exports = {
  register,
  login,
  logout,
};
