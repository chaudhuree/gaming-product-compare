const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { RatingService } = require('./rating.service');

const rateProduct = catchAsync(async (req, res) => {
  const { rating } = req.body;
  const { productId } = req.params;
  const userId = req.user.id;

  const result = await RatingService.rateProduct(userId, productId, rating);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product rated successfully',
    data: result,
  });
});

const getProductRatings = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const result = await RatingService.getProductRatings(productId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product ratings retrieved successfully',
    data: result,
  });
});

const getUserProductRating = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const result = await RatingService.getUserProductRating(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User product rating retrieved successfully',
    data: result,
  });
});

const RatingController = {
  rateProduct,
  getProductRatings,
  getUserProductRating,
};

module.exports = { RatingController };
