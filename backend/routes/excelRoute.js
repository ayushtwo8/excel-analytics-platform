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
    saveChartConfiguration,
    getFileCharts,
} from "../controllers/chartController.js";
import { generateInsights } from "../controllers/insightsController.js";

const excelRouter = Router();

excelRouter.use(authMiddleware);

// file upload and parsing
excelRouter.post("/upload", upload.single("excelFile"), uploadExcel);

// generate chart 
excelRouter.post("/generate-chart", generateChart);

// save metadata to db, permanently
excelRouter.post("/save-file", saveFileToDB);

// manage saved chart configuration file
excelRouter.post("/files/:dbFileId/charts",saveChartConfiguration);
excelRouter.get("/files/:dbFileId/charts", getFileCharts);

// get all files for logged in user
excelRouter.get("/files", getUserFiles);

// get specific file details
excelRouter.get("/files/:dbFileId", getFileById);

// delete a file
excelRouter.delete("/files/:dbFileId", deleteFile);

// for insight
excelRouter.post("/insights/generate", generateInsights);

export default excelRouter;