const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { BrandService } = require('./brand.service');
const pick = require('../../utils/pick');

const createBrand = catchAsync(async (req, res) => {
  const result = await BrandService.createBrand(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Brand created successfully',
    data: result,
  });
});

const getAllBrands = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await BrandService.getAllBrands(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Brands retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getBrandById = catchAsync(async (req, res) => {
  const result = await BrandService.getBrandById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Brand retrieved successfully',
    data: result,
  });
});

const updateBrand = catchAsync(async (req, res) => {
  const result = await BrandService.updateBrand(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Brand updated successfully',
    data: result,
  });
});

const deleteBrand = catchAsync(async (req, res) => {
  await BrandService.deleteBrand(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Brand deleted successfully',
  });
});

const BrandController = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};

module.exports = { BrandController };
