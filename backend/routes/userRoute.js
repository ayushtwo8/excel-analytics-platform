import { Router } from 'express'
import { signup } from '../controllers/userController.js';

const userRouter = Router();

export default userRouter.post('/', signup);