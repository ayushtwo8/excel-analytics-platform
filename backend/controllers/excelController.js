import path from "path";
import fs from "fs/promises";
import FileModel from "../models/fileModel.js";
import { parseExcel, generateChartData } from "../services/excelService.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Upload and parse Excel file
 */
export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    const filePath = req.file.path;
    const relativePath = path
      .relative(path.join(__dirname, ".."), filePath)
      .replace(/\\/g, "/");
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/${relativePath}`;

    // Parse Excel file to extract sheet information
    const sheets = await parseExcel(filePath);

    // Create a file record in the database
    const fileRecord = new FileModel({
      filename: req.file.filename,
      originalname: req.file.originalname,
      filepath: filePath,
      fileUrl: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.uid,
      sheets: sheets.map((sheet) => ({
        name: sheet.name,
        columns: sheet.columns,
        rowCount: sheet.rowCount,
      })),
    });

    await fileRecord.save();

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      fileId: fileRecord._id,
      fileUrl: fileUrl,
      sheets: sheets.map((sheet) => ({
        name: sheet.name,
        columns: sheet.columns,
        rowCount: sheet.rowCount,
        data: sheet.data, // Include preview data for the frontend
      })),
    });
  } catch (error) {
    console.error("Upload Excel error:", error);

    // Clean up file if there was an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * Get list of user's Excel files
 */
export const getUserFiles = async (req, res) => {
  try {
    const files = await FileModel.find({ uploadedBy: req.user.uid })
      .select("filename originalname fileUrl createdAt sheets")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("Get user files error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * Get file details by ID
 */
export const getFileById = async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check if the file belongs to the user
    if (file.uploadedBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this file",
      });
    }

    res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * Generate chart data based on file and options
 */
export const generateChart = async (req, res) => {
  try {
    const { fileId } = req.params;
    const {
      sheet,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      aggregation,
      title,
      filters,
    } = req.body;

    // Validate required fields
    if (!sheet || !chartType || !xAxis) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: sheet, chartType, xAxis",
      });
    }

    // Get file from database
    const file = await FileModel.findById(fileId);
   

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
    // Check if file exists on disk
    try {
      await fs.access(file.filepath);
    } catch (error) {
      console.error("File does not exist at path:", file.filepath);
      return res.status(404).json({
        success: false,
        message: "File not found on disk",
      });
    }

    // Check if the file belongs to the user
    if (file.uploadedBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this file",
      });
    }

    // Generate chart data with more specific error handling
    try {
      // Check if the specified sheet exists in the file
      const workbook = XLSX.readFile(file.filepath);
      if (!workbook.SheetNames.includes(sheet)) {
        return res.status(400).json({
          success: false,
          message: `Sheet '${sheet}' does not exist in the file`,
        });
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
      console.log("Chart data generated successfully:", chartData);

      const cleanConfig = {
        sheet,
        xAxis,
        yAxis,
        zAxis: zAxis || null,
        aggregation: aggregation || "sum",
        filters: filters || [],
      };

      // Save chart configuration to the file record
      const chartConfig = {
        title: title || `${chartType} chart of ${xAxis} vs ${yAxis}`,
        type: chartType,
        config: cleanConfig,
      };

      // Use updateOne to safely add the chart
      await FileModel.updateOne(
        { _id: fileId },
        { $push: { charts: chartConfig } }
      );

      // Get the new chart ID by fetching the updated document
      const updatedFile = await FileModel.findById(fileId);
      const newChartId =
        updatedFile.charts[updatedFile.charts.length - 1]._id ||
        `${fileId}-${Date.now()}`;

        console.log("New chart ID:", newChartId);

      res.status(200).json({
        success: true,
        chartData,
        chartId: newChartId,
      });
    } catch (chartError) {
      console.error("Error generating chart data:", chartError);
      return res.status(400).json({
        success: false,
        message: `Error generating chart: ${chartError.message}`,
      });
    }
  } catch (error) {
    console.error("Generate chart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Get saved charts for a file
 */
export const getFileCharts = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileModel.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check if the file belongs to the user
    if (file.uploadedBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this file",
      });
    }

    // Parse any stringified chart objects
    const parsedCharts = file.charts.map((chart) =>
      typeof chart === "string" ? JSON.parse(chart) : chart
    );

    res.status(200).json({
      success: true,
      charts: parsedCharts,
    });
  } catch (error) {
    console.error("Get file charts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * Delete file by ID
 */
export const deleteFile = async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Check if the file belongs to the user
    if (file.uploadedBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this file",
      });
    }

    // Delete the physical file
    try {
      await fs.unlink(file.filepath);
    } catch (unlinkError) {
      console.error("Error deleting physical file:", unlinkError);
      // Continue with deletion even if physical file removal fails
    }

    // Delete file from database
    await FileModel.findByIdAndDelete(file._id);

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
