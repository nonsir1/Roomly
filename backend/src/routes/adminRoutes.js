import express from 'express';
import { authenticate, checkAdmin } from '../middleware/auth.js';
import { 
  updateRoom, 
  deleteRoom 
} from '../controllers/roomsController.js';
import { 
  updateFeature, 
  deleteFeature 
} from '../controllers/featuresController.js';
import {
  getAllUsers,
  getUser,
  getUserBookings,
  updateUser,
  deleteUser
} from '../controllers/usersController.js';

const router = express.Router();

router.use(authenticate);
router.use(checkAdmin);

router.put('/admin/rooms/:room_id', updateRoom);
router.delete('/admin/rooms/:room_id', deleteRoom);

router.put('/admin/features/:feature_id', updateFeature);
router.delete('/admin/features/:feature_id', deleteFeature);

router.get('/admin/users', getAllUsers);
router.get('/admin/users/:user_id', getUser);
router.get('/admin/users/:user_id/bookings', getUserBookings);
router.put('/admin/users/:user_id', updateUser);
router.delete('/admin/users/:user_id', deleteUser);

export default router;

