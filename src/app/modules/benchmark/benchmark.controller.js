const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { BenchmarkService } = require('./benchmark.service');
const pick = require('../../utils/pick');

const createBenchmark = catchAsync(async (req, res) => {
  const result = await BenchmarkService.createBenchmark(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Benchmark created successfully',
    data: result,
  });
});

const getAllBenchmarks = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await BenchmarkService.getAllBenchmarks(filters, options);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Benchmarks retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getBenchmarkById = catchAsync(async (req, res) => {
  const result = await BenchmarkService.getBenchmarkById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Benchmark retrieved successfully',
    data: result,
  });
});

const addProductBenchmark = catchAsync(async (req, res) => {
  const result = await BenchmarkService.addProductBenchmark({
    ...req.body,
    productId: req.params.productId,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product benchmark added successfully',
    data: result,
  });
});

const compareProducts = catchAsync(async (req, res) => {
  const result = await BenchmarkService.compareProducts(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Products compared successfully',
    meta: null,
    data: result,
  });
});

const getProductBenchmarks = catchAsync(async (req, res) => {
  const result = await BenchmarkService.getProductBenchmarks(req.params.productId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product benchmarks retrieved successfully',
    data: result,
  });
});

const updateBenchmark = catchAsync(async (req, res) => {
  const result = await BenchmarkService.updateBenchmark(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Benchmark updated successfully',
    data: result,
  });
});

const deleteBenchmark = catchAsync(async (req, res) => {
  await BenchmarkService.deleteBenchmark(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Benchmark deleted successfully',
  });
});

const updateProductBenchmark = catchAsync(async (req, res) => {
  const { productId, benchmarkId } = req.params;
  const result = await BenchmarkService.updateProductBenchmark(
    productId,
    benchmarkId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product benchmark updated successfully',
    data: result,
  });
});

const deleteProductBenchmark = catchAsync(async (req, res) => {
  const { productId, benchmarkId } = req.params;
  await BenchmarkService.deleteProductBenchmark(productId, benchmarkId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Product benchmark deleted successfully',
  });
});

const BenchmarkController = {
  createBenchmark,
  getAllBenchmarks,
  getBenchmarkById,
  addProductBenchmark,
  updateProductBenchmark,
  deleteProductBenchmark,
  compareProducts,
  getProductBenchmarks,
  updateBenchmark,
  deleteBenchmark,
};

module.exports = { BenchmarkController };
