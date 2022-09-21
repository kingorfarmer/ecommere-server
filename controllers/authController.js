const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')

const signUpToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_90D
  })
}

const loginToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_12H
  })
}

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  const token = signUpToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    next(new AppError('Please provide email and password!', 400))
  }

  // '+' is select field which can not select on database (select: false)
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password)

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401))
  }

  const token = loginToken(user._id)
  res.status(200).json({
    status: 'success',
    token
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401))
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  const user = await User.findById(decoded.id)
  if (!user) {
    return next(new AppError('The user belong to this token does not longer exist', 401))
  }

  if (user.chagedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401))
  }

  req.user = user
  next()
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403))
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with this email', 404))
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

})
exports.resetPassword = (req, res, next) => { }