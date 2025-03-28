import express from 'express';
import { getRooms } from '../controllers/roomController';

const router = express.Router();

router.get('/rooms', getRooms);

export default router;
