import { Router } from "express";

import upload from "../middlewares/fileUploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddlware.js";
import { deleteFile, generateChart, getFileById, getFileCharts, getUserFiles, uploadExcel } from "../controllers/excelController.js";

const excelRouter = Router();

excelRouter.use(authMiddleware);

excelRouter.post('/upload', upload.single('excelFile'), uploadExcel);
excelRouter.get('/files', getUserFiles);
excelRouter.get('/files/:fileId', getFileById);
excelRouter.delete('/files/:fileId', deleteFile);

// Chart generation routes
excelRouter.post('/files/:fileId/charts', generateChart);
excelRouter.get('/files/:fileId/charts', getFileCharts);

export default excelRouter;