const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer')

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users')
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1]
    callback(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(new AppError('Not image!', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

const filterObj = (obj, ...allowedFields) => {
  const filter = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filter[el] = obj[el];
  });

  return filter;
};

exports.uploadUserPhoto = upload.single('photo')
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next()
  next()
}

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(201).json({
    status: 'success',
    total: users.length,
    data: {
      users,
    },
  });
});

exports.updateInfo = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Only update personal info', 400));
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null
  });
})

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
// exports.deleteUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route is not yet defined' });
// };
