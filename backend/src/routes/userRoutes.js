import express from 'express';
import { registerUser, getLoggedInUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/loggedinuser', getLoggedInUser);
router.patch('/userupdate/:email', updateUser);

export default router;
