import express from 'express';
import { getRooms, getRoom, createRoom } from '../controllers/roomsController.js';

const router = express.Router();

router.get('/rooms/', getRooms);
router.get('/rooms/:room_id', getRoom);
router.post('/rooms/', createRoom);

export default router;

