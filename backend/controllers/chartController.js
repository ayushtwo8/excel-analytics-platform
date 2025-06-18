import XLSX from "xlsx";
import FileModel from "../models/fileModel.js";
import { generateChartData } from "../services/excelService.js";
import { isOwner } from "../utils/authHelpers.js";
import { logError } from "../utils/logger.js";
import fileStore from "../utils/chartStore.js";

// Generate chart data
export const generateChart = async (req, res) => {
  console.log("generateChart called");

  try {
    const {
      fileIdentifier,
      sheet,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      title,
      filters,
      aggregation,
    } = req.body;

    if (!fileIdentifier || !sheet || !chartType || !xAxis || !yAxis) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: fileIdentifier, sheet, chartType, xAxis, yAxis.",
      });
    }

    let filePathToUse;

    const tempFileInfo = fileStore.get(fileIdentifier);
    if (tempFileInfo) {
      console.log(`Generating chart from temporary file: ${fileIdentifier}`);
      filePathToUse = tempFileInfo.filePath;
      console.log("filePathToUse: ", filePathToUse)
    } else {
      console.log(`Generating chart from saved DB file: ${fileIdentifier}`);
      const dbFile = await FileModel.findById(fileIdentifier);
      if (!dbFile) {
        return res.status(404).json({
          success: false,
          message: "Source file not found in database.",
        });
      }

      // checking ownership
      if (!isOwner(dbFile, req.user.uid)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to generate chart for this file.",
        });
      }

      filePathToUse = dbFile.filepath;
            console.log("filePathToUse: ", filePathToUse)

      // fileOwnerId = dbFile.uploadedBy.toString();
    }

    if (!filePathToUse) {
            console.log("filePathToUse: ", filePathToUse)

      return res.status(404).json({
        success: false,
        message: "File path could not be determined.",
      });
    }

    let workbook;
    try {
      workbook = XLSX.readFile(filePathToUse);
      console.log("Workbook read successfully in controller.");
    } catch (readError) {
      logError("Error reading Excel file for chart generation", readError);
      return res
        .status(500)
        .json({ success: false, message: "Error reading the Excel file." });
    }

    if (!workbook.SheetNames.includes(sheet)) {
      return res.status(400).json({
        success: false,
        message: `Sheet '${sheet}' does not exist in the file.`,
      });
    }


    
    const chartData = await generateChartData(workbook, {
      sheet,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      aggregation,
      filters,
      title
    });

    console.log("Chart data generated sucessfully by service");
    res.status(200).json({
      success: true,
      message: "Chart data generated.",
      chartData,
      configUsed: {
        sheet,
        chartType,
        xAxis,
        yAxis,
        zAxis,
        title,
        filters,
        aggregation,
      },
    });
  } catch (error) {
    logError("Generate chart error", error);
    res.status(500).json({
      success: false,
      message: error.message || "Chart generation failed.",
    });
  }
};

export const saveChartConfiguration = async (req, res) => {
  console.log("saveChartConfiguration controller called");

  try {
    const { dbFileId } = req.params;
    const { sheetName, chartType, config, savedChartName } = req.body;

    if (!sheetName || !chartType || !config || !config.xAxis || !config.yAxis) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required chart data: sheetName, chartType, or config (with xAxis, yAxis).",
      });
    }

    const file = await FileModel.findById(dbFileId);
    if (!file) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Parent file not found in database.",
        });
    }
    if (!isOwner(file, req.user.uid)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to save chart to this file.",
        });
    }

    const newChartConfig = {
      sheetName,
      chartType,
      config,
      savedChartName:
        savedChartName || config.title || `Chart for ${sheetName}`,
    };

    file.charts.push(newChartConfig);
    await file.save();

    const savedChart = file.charts[file.charts.length - 1];

    res.status(201).json({
      success: true,
      message: "Chart configuration saved successfully to the file.",
      chart: savedChart,
    });
  } catch (error) {
    logError("Save chart configuration error", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Validation Error: ${error.message}`,
        });
    }
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to save chart configuration.",
      });
  }
};

export const getFileCharts = async (req, res) => {
  console.log("getFileCharts controller called");
  try {
    const { dbFileId } = req.params;
    const file = await FileModel.findById(dbFileId).select("charts uploadedBy");

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found." });
    }
    if (!isOwner(file, req.user.uid)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to view charts for this file.",
        });
    }

    res.status(200).json({ success: true, charts: file.charts || [] });
  } catch (error) {
    logError("Get file charts error", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to retrieve charts for the file.",
      });
  }
};
