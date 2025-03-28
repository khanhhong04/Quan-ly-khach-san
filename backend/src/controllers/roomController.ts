import { Request, Response } from 'express';
import pool from '../config/database';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM rooms');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
