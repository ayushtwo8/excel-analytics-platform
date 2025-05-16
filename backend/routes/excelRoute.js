import { Router } from "express";
import upload from "../middlewares/fileUploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddlware.js";

import {
    uploadExcel,
    saveFileToDB,
    getUserFiles,
    getFileById,
    deleteFile,
} from "../controllers/fileController.js";

import {
    generateChart,
    getFileCharts,
} from "../controllers/chartController.js";

const excelRouter = Router();

// Apply authentication middleware to all routes
excelRouter.use(authMiddleware);


// File Routes
excelRouter.post("/upload", upload.single("excelFile"), uploadExcel);
excelRouter.post("/saveFile", saveFileToDB);
excelRouter.get("/files", getUserFiles);
excelRouter.get("/files/:fileId", getFileById);
excelRouter.delete("/files/:fileId", deleteFile);

// Chart Routes
excelRouter.post("/files/:fileId/charts", generateChart);
excelRouter.get("/files/:fileId/charts", getFileCharts);

export default excelRouter;
