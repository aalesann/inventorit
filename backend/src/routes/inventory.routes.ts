import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { assetValidation, validateRequest } from '../middlewares/validators.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/inventory - Get all assets with filters and pagination
router.get('/', inventoryController.getAssets);

// GET /api/inventory/:id - Get asset by ID
router.get('/:id', inventoryController.getAssetById);

// POST /api/inventory - Create new asset
router.post('/', assetValidation, validateRequest, inventoryController.createAsset);

// PUT /api/inventory/:id - Update asset
router.put('/:id', inventoryController.updateAsset);

// DELETE /api/inventory/:id - Soft delete asset
router.delete('/:id', inventoryController.deleteAsset);

export default router;
