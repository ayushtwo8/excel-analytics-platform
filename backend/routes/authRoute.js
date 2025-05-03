import { Router } from 'express'
import { signup } from '../controllers/authController.js';

const authRouter = Router();

export default authRouter.post('/', signup);