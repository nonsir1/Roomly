import express from 'express';
import {
  createBooking,
  updateBooking,
  getMyBookings,
  deleteBooking,
  getAllBookings,
  getRoomBookings
} from '../controllers/bookingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/bookings/', createBooking);
router.put('/bookings/:booking_id', authenticate, updateBooking);
router.get('/bookings/my', authenticate, getMyBookings);
router.delete('/bookings/:booking_id', authenticate, deleteBooking);
router.get('/bookings/', getAllBookings);
router.get('/bookings/room/:room_id', getRoomBookings);

export default router;

