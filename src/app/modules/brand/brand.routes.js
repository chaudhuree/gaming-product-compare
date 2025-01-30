const express = require('express');
const { BrandController } = require('./brand.controller');
const auth = require('../../middlewares/auth');
const { RoleEnum } = require('@prisma/client');

const router = express.Router();

router.post(
  '/create-brand',
  auth(RoleEnum.ADMIN),
  BrandController.createBrand
);

router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrandById);

router.patch(
  '/:id',
  auth(RoleEnum.ADMIN),
  BrandController.updateBrand
);

router.delete(
  '/:id',
  auth(RoleEnum.ADMIN),
  BrandController.deleteBrand
);

module.exports = router;
