import fs from "fs/promises";
import XLSX from "xlsx";
import FileModel from "../models/fileModel.js";
import { generateChartData } from "../services/excelService.js";
import { isOwner } from "../utils/authHelpers.js";
import { logError } from "../utils/logger.js";

// Generate chart data
export const generateChart = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { sheet, chartType, xAxis, yAxis, zAxis, aggregation, title, filters } = req.body;

    if (!sheet || !chartType || !xAxis) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: sheet, chartType, xAxis",
      });
    }

    const file = await FileModel.findById(fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    if (!isOwner(file, req.user.uid)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    try {
      await fs.access(file.filepath);
    } catch {
      return res.status(404).json({ success: false, message: "File not found on disk" });
    }

    const workbook = XLSX.readFile(file.filepath);
    if (!workbook.SheetNames.includes(sheet)) {
      return res.status(400).json({ success: false, message: `Sheet '${sheet}' does not exist` });
    }

    const chartData = await generateChartData(file.filepath, {
      sheet,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      aggregation,
      filters,
    });

    const chartConfig = {
      title: title || `${chartType} chart of ${xAxis} vs ${yAxis}`,
      type: chartType,
      config: {
        sheet,
        xAxis,
        yAxis,
        zAxis: zAxis || null,
        aggregation: aggregation || "sum",
        filters: filters || [],
      },
    };

    await FileModel.updateOne({ _id: fileId }, { $push: { charts: chartConfig } });

    const updatedFile = await FileModel.findById(fileId);
    const newChartId = updatedFile.charts[updatedFile.charts.length - 1]._id;

    res.status(200).json({ success: true, chartData, chartId: newChartId });
  } catch (error) {
    logError("Generate chart error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all saved charts for a file
export const getFileCharts = async (req, res) => {
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
