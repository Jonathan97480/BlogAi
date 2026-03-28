import express from 'express';
import { loginAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/', loginAdmin);

export default router;
