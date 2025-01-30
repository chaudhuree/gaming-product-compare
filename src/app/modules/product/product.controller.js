const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { ProductService } = require('./product.service');
const pick = require('../../utils/pick');

const createProduct = catchAsync(async (req, res) => {
  const result = await ProductService.createProduct(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm', 'categoryId', 'brandId', 'minPrice', 'maxPrice']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await ProductService.getAllProducts(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Products retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const result = await ProductService.getProductById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const result = await ProductService.updateProduct(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product deleted successfully',
  });
});

const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

module.exports = { ProductController };
