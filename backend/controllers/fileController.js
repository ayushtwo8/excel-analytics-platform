import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; 
import FileModel from "../models/fileModel.js";
import { parseExcel } from "../services/excelService.js";
import { getFileUrl } from "../utils/fileHelpers.js";
import { isOwner } from "../utils/authHelpers.js";
import { logError } from "../utils/logger.js";
import fileStore from "../utils/chartStore.js";

// Upload and parse Excel file
export const uploadExcel = async (req, res) => {
  console.log("uploadExcel controller called");
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an Excel file" });
    }

    const { file } = req;
    const tempFileId = uuidv4();

    // for preview
    const sheetsPreview = await parseExcel(file.path);

    // Store file info in memory
    fileStore.set(tempFileId, {
      filePath: file.path,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sheets: sheetsPreview
    });

    console.log(`File stored in memory with tempFileId: ${tempFileId}`);

    res.status(200).json({
      success: true,
      message: "File uploaded and parsed successfully, ready for chart generation or saving.",
      tempFileId,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sheets: sheetsPreview.map(({ name, columns, rowCount, data }) => ({
        name,
        columns,
        rowCount,
        data,
      })),
    });
  } catch (error) {
    logError("Upload excel error", error);
    if(req.file && req.file.path){
      await fs.unlink(req.file.path).catch(err => logError("Cleanup unlink error", err));
    }
    res.status(500).json({success: false, message: error.message || "File upload processing failed."})
  }
};

// save file metadata to db, permanently
export const saveFileToDB = async(req, res) => {
  console.log("saveFileToDB controlled called");

  try{
    const { tempFileId, originalname, mimetype, size } = req.body;

    if(!tempFileId) {
      return res.status(400).json({ success: false, message: "tempFileId is required."});
    }

    const fileInfoFromStore = fileStore.get(tempFileId);
    if(!fileInfoFromStore){
      return res.status(404).json({success: false, message: "File session expired or not found. Please re-upload."});
    }

    const { filePath, sheets } = fileInfoFromStore;

    const finalOriginalName = originalname || fileInfoFromStore.originalname;
    const finalMimeType = mimetype || fileInfoFromStore.mimetype;
    const finalSize = size || fileInfoFromStore.size;

    if (!finalOriginalName || !finalMimeType || !finalSize) {
        return res.status(400).json({ success: false, message: "Missing file metadata (originalname, mimetype, size)." });
    }

    const fileUrl = getFileUrl(req, filePath);

    const newFile = new FileModel({
        fileId: tempFileId,
      filename: path.basename(filePath),
      originalname: finalOriginalName,
      filepath: filePath,
      fileUrl,
      mimetype: finalMimeType,
      size: finalSize,
      uploadedBy: req.user.uid,
      sheets: sheets
    })

    await newFile.save();
    
    fileStore.delete(tempFileId);

    console.log(`File metadata saved to DB with ID: ${newFile._id}`);

    res.status(201).json({
      success: true,
      message: 'File saved permanently to database!',
      dbFileId: newFile._id,
      fileUrl: newFile.fileUrl
    });
  }catch(error){
    logError("Save file to DB error", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: `Validation Error: ${error.message}` });
    }
    res.status(500).json({ success: false, message: error.message || "Failed to save file to database." });
  }
}

export const getUserFiles = async(req, res) => {
  console.log("getUserFile controlled called");
  try {
    const files = await FileModel.find({ uploadedBy: req.user.uid})
      .select("originalname filename fileUrl createdAt sheets._id sheets.name sheets.rowCount")
      .sort({createdAt: -1});

      res.status(200).json({ success: true, count: files.length, files });
  } catch(error){
    logError(`Get user files error ${error}`);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve user files." });
  }
}

export const getFileById = async (req, res) => {
  console.log("getFileById controller called");

  try {
    const { dbFileId } = req.params;
    const fileRecord = await FileModel.findById(dbFileId).lean();
    // const file = await FileModel.findById(dbFileId);

    if(!fileRecord){
      return res.status(404).json({ success: false, message: "File not found." });
    }

    if (!isOwner(fileRecord, req.user.uid)) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this file." });
    }

    let fileBuffer;
    try{
      fileBuffer = await fs.readFile(fileRecord.filepath);
    } catch(readError){
      logError(`Physical file not found at path: ${fileRecord.filepath}`, readError);
      return res.status(404).json({ success: false, message: "File data not found on server, though record exists." });
    }

    const sheetsWithPreviewData = await parseExcel(fileBuffer);
    const hydratedSheets = fileRecord.sheets.map(dbSheet => {
        const previewSheet = sheetsWithPreviewData.find(pSheet => pSheet.name === dbSheet.name);
        
        return {
            ...dbSheet, // Contains _id, name, columns, rowCount from DB
            data: previewSheet ? previewSheet.data : [], // Add the data rows
        };
    });

    const finalFileResponse = {
      ...fileRecord,
      sheets: hydratedSheets, // Use the sheets that now include the data
    };

    res.status(200).json({success: true, file: finalFileResponse});
  } catch (error) {
      logError("Get file by Id error", error);
      res.status(500).json({ success: false, message: error.message || "Failed to retrieve file details." });
  }
}

export const deleteFile = async (req, res) => {
  console.log("deleteFile controller called");

  try {
    const { dbFileId } = req.params;
    const file = await FileModel.findById(dbFileId);

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found." });
    }
    if (!isOwner(file, req.user.uid)) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this file." });
    }

    // delete physical file
    try {
      await fs.unlink(file.filepath);
      console.log(`Physical file deleted: ${file.filepath}`);
    } catch(unlinkError){
      logError(`Physical file deletion failed for ${file.filepath}`, unlinkError);
    }

    await FileModel.findByIdAndDelete(dbFileId);
    res.status(200).json({ success: true, message: "File and its metadata deleted successfully." });
  } catch(error){
    logError("Delete file error", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete file." });
  }
}