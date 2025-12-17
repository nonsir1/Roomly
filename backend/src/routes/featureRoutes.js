import express from 'express';
import { createFeature, getFeatures } from '../controllers/featuresController.js';

const router = express.Router();

router.post('/features/', createFeature);
router.get('/features/', getFeatures);

export default router;

