const express = require('express');
const multer = require('multer')
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const upload = multer({dest: 'public/img/users'})
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

router.patch(
  '/update-info',
  upload.single('photo'),
  authController.protect,
  userController.updateInfo
);

router.delete(
  '/delete-user',
  authController.protect,
  userController.deleteUser
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
