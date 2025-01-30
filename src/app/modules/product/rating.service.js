const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');

const rateProduct = async (userId, productId, rating) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Rate the product
  const result = await prisma.productRating.upsert({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    update: {
      rating,
    },
    create: {
      productId,
      userId,
      rating,
    },
  });

  // Calculate and update average rating
  const averageRating = await prisma.productRating.aggregate({
    where: {
      productId,
    },
    _avg: {
      rating: true,
    },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: averageRating._avg.rating,
    },
  });

  return result;
};

const getProductRatings = async (productId) => {
  const ratings = await prisma.productRating.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return ratings;
};

const getUserProductRating = async (userId, productId) => {
  const rating = await prisma.productRating.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  return rating;
};

const RatingService = {
  rateProduct,
  getProductRatings,
  getUserProductRating,
};

module.exports = { RatingService };
