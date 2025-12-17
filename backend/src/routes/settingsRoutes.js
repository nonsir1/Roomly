import express from 'express';
import { getSettings, updateSetting, updateSettings } from '../controllers/settingsController.js';
import { authenticate, checkAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);

router.put('/:key', authenticate, checkAdmin, updateSetting);

router.put('/', authenticate, checkAdmin, updateSettings);

export default router;

