import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshAccessToken 
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', verifyJWT, logout);

export default router;