import { Router } from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  updateAvatar,
  checkUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddlware.js";

const userRouter = Router();

userRouter.post('/checkUser', checkUser)
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/profile", authMiddleware, createProfile);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.post("/avatar", authMiddleware, updateAvatar);

export default userRouter;
