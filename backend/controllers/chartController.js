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
    const { fileId } = req.params;

    const { sheet, chartType, xAxis, yAxis, zAxis, title, filters, aggregation } = req.body;

    if (!sheet || !chartType || !xAxis || !yAxis) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: sheet, chartType, xAxis, yAxis",
      });
    }

    // Check if file exists in memory
    const fileInfo = fileStore.get(fileId);
    console.log("Requesting fileId:", fileId);

    
    if (!fileInfo) {
      return res.status(404).json({ success: false, message: "File not found in memory" });
    }

    const { filePath, sheets } = fileInfo;

    const workbook = XLSX.readFile(filePath);
    if (!workbook.SheetNames.includes(sheet)) {
      return res.status(400).json({ success: false, message: `Sheet '${sheet}' does not exist` });
    }

    const chartData = await generateChartData(filePath, {
      sheet,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      aggregation,
      filters,
    });

    console.log("Chart data generated successfully", chartData);

    res.status(200).json({
      success: true,
      chartData,
    });
  } catch (error) {
    logError("Generate chart error", error);
    res.status(500).json({
      success: false,
      message: error.message || "Chart generation failed",
    });
  }
};



// Get all saved charts for a file
export const getFileCharts = async (req, res) => {
  console.log("getFileCharts called");
  try {
    const { fileId } = req.params;
    const file = await FileModel.findById(fileId);

    if (!file) return res.status(404).json({ success: false, message: "File not found" });
    if (!isOwner(file, req.user.uid)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const charts = file.charts.map((chart) =>
      typeof chart === "string" ? JSON.parse(chart) : chart
    );

    res.status(200).json({ success: true, charts });
  } catch (error) {
    logError("Get file charts error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
