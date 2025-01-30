const express = require('express');
const { ProductController } = require('./product.controller');
const { RatingController } = require('./rating.controller');
const auth = require('../../middlewares/auth');
const { RoleEnum } = require('@prisma/client');
const { upload } = require('../../middlewares/upload');
const { uploadFile } = require('../../utils/uploadFile');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

// File upload route
router.post(
  '/upload-file',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  upload.single('file'),
  catchAsync(async (req, res) => {
    const file = req.file;
    const result = await uploadFile(file);
    
    if (!result.success) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: result.error || 'File upload failed',
      });
    }

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'File uploaded successfully',
      data: { url: result.url },
    });
  })
);

// Product CRUD routes
router.post(
  '/create-product',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  ProductController.createProduct
);

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

router.patch(
  '/:id',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  auth(RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  ProductController.deleteProduct
);

// Product Rating routes
router.post(
  '/:productId/rate',
  auth(RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  RatingController.rateProduct
);

router.get(
  '/:productId/ratings',
  RatingController.getProductRatings
);

router.get(
  '/:productId/my-rating',
  auth(RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.CONTENT_CREATOR),
  RatingController.getUserProductRating
);

module.exports = router;
