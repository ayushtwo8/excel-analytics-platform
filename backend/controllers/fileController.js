import fs from "fs/promises";
import path from "path";
import FileModel from "../models/fileModel.js";
import { parseExcel } from "../services/excelService.js";
import { getFileUrl } from "../utils/fileHelpers.js";
import { isOwner } from "../utils/authHelpers.js";
import { logError } from "../utils/logger.js";

// Upload and parse Excel file
export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an Excel file" });
    }

    const { file } = req;
    const fileUrl = getFileUrl(req, file.path);
    const sheets = await parseExcel(file.path);

    res.status(200).json({
      success: true,
      message: "File uploaded and parsed successfully",
      filePath: file.path,
      fileUrl,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sheets: sheets.map(({ name, columns, rowCount, data }) => ({ name, columns, rowCount, data })),
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(console.error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save file info to DB
export const saveFileToDB = async (req, res) => {
  try {
    const { filePath, originalname, mimetype, size, sheets } = req.body;

    if (!filePath || !sheets || !req.user?.uid) {
      return res.status(400).json({ success: false, message: "Missing required data" });
    }

    const fileUrl = getFileUrl(req, filePath);

    const newFile = new FileModel({
      filename: path.basename(filePath),
      originalname,
      filepath: filePath,
      fileUrl,
      mimetype,
      size,
      uploadedBy: req.user.uid,
      sheets,
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: "File saved to database",
      fileId: newFile._id,
      fileUrl,
    });
  } catch (error) {
    logError("Error saving file to DB", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all files of a user
export const getUserFiles = async (req, res) => {
  try {
    const files = await FileModel.find({ uploadedBy: req.user.uid })
      .select("filename originalname fileUrl createdAt sheets")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: files.length, files });
  } catch (error) {
    logError("Error getting user files", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get file by ID
export const getFileById = async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });
    if (!isOwner(file, req.user.uid)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    res.status(200).json({ success: true, file });
  } catch (error) {
    logError("Error getting file by ID", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete file by ID
export const deleteFile = async (req, res) => {
  try {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });
    if (!isOwner(file, req.user.uid)) {
      return res.status(403).json({ success: false, message: "Unauthorized deletion" });
    }

    await fs.unlink(file.filepath).catch((err) => logError("Physical file deletion failed", err));
    await FileModel.findByIdAndDelete(file._id);

    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    logError("Delete file error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
