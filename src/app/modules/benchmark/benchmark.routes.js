const express = require('express');
const { BenchmarkController } = require('./benchmark.controller');
const auth = require('../../middlewares/auth');
const { RoleEnum } = require('@prisma/client');

const router = express.Router();

// Benchmark CRUD routes
router.post(
  '/create-benchmark',
  auth(RoleEnum.ADMIN),
  BenchmarkController.createBenchmark
);

router.get('/', BenchmarkController.getAllBenchmarks);
router.get('/:id', BenchmarkController.getBenchmarkById);

router.patch(
  '/:id',
  auth(RoleEnum.ADMIN),
  BenchmarkController.updateBenchmark
);

router.delete(
  '/:id',
  auth(RoleEnum.ADMIN),
  BenchmarkController.deleteBenchmark
);

// Product Benchmark routes
router.post(
  '/products/:productId/benchmark',
  auth(RoleEnum.ADMIN),
  BenchmarkController.addProductBenchmark
);

router.patch(
  '/products/:productId/benchmark/:benchmarkId',
  auth(RoleEnum.ADMIN),
  BenchmarkController.updateProductBenchmark
);

router.delete(
  '/products/:productId/benchmark/:benchmarkId',
  auth(RoleEnum.ADMIN),
  BenchmarkController.deleteProductBenchmark
);

router.get(
  '/products/:productId/benchmarks',
  BenchmarkController.getProductBenchmarks
);

// Compare products route
router.post(
  '/compare',
  BenchmarkController.compareProducts
);

module.exports = router;
