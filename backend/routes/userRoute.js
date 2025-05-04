import { Router } from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddlware.js";

const userRouter = Router();

userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/profile", authMiddleware, createProfile);
userRouter.put("/profile", authMiddleware, updateProfile);

export default userRouter;
