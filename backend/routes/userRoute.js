import { Router } from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  updateAvatar,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddlware.js";

const userRouter = Router();

userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/profile", authMiddleware, createProfile);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.post("/avatar", authMiddleware, updateAvatar);

export default userRouter;
