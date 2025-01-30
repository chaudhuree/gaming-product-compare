const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { CategoryService } = require('./category.service');
const pick = require('../../utils/pick');

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategory(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await CategoryService.getAllCategories(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Categories retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const result = await CategoryService.getCategoryById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category retrieved successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.updateCategory(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  await CategoryService.deleteCategory(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category deleted successfully',
  });
});

const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

module.exports = { CategoryController };
