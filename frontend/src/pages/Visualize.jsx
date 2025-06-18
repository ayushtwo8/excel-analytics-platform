// src/features/visualize/Visualize.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// UI Imports from ShadCN (ensure paths are correct)
import { Alert, AlertDescription } from "@/components/ui/alert";

// Context & Libs
import { useUserAuth } from "@/context/userAuthContext"; // Assuming path

// Local Components
import FileUploaderUI from "../components/FileUploaderUI";
import ChartControlsUI from "../components/ChartControlsUI";
import DataPreviewTableUI from "../components/DataPreviewTableUI";
import ChartDisplayUI from "../components/ChartDisplayUI";

// Utils & Constants
import {
  pageContainerVariants,
  sectionVariants,
  alertVariants,
} from "../utils/motionVariants.jsx";
import {
  formatDataForFrontend,
  renderChartVisualization,
  downloadChartAsPng,
} from "../utils/chartHelpers";
import { FaSpinner } from "react-icons/fa";
import SmartInsights from "./SmartInsights";
import { Button } from "@/components/ui/button";

const Visualize = () => {
  const { user } = useUserAuth(); // Assuming user object is available
  const { dbFileId } = useParams(); // Get dbFileId from URL if present
  console.log(dbFileId);
  const navigate = useNavigate();

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null); // Holds the File object for display
  const [originalFileDetails, setOriginalFileDetails] = useState(null); // { originalname, mimetype, size }
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null); // Temp ID from backend after upload
  const [isFileSaved, setIsFileSaved] = useState(false); // Track if current uploaded file is saved to DB
  const [isLoadingFileDetails, setIsLoadingFileDetails] = useState(false);

  // Sheet & Column State
  const [sheets, setSheets] = useState([]); // [{ name, columns, rowCount, previewData }]
  const [selectedSheet, setSelectedSheet] = useState("");
  const [columns, setColumns] = useState([]);

  // Chart Configuration State
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState(""); // For 3D charts
  const [chartType, setChartType] = useState("bar");

  // Chart Data & Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawChartData, setRawChartData] = useState(null); // Raw data from backend
  const [formattedChartData, setFormattedChartData] = useState(null); // Data formatted for Recharts/Plotly
  const [chartConfig, setChartConfig] = useState(null); // Config from backend { xAxis, yAxis, zAxis, title }

  // UI Interaction State
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false); // For "Save File" operation

  // Refs
  const inputRef = useRef(null);
  const chartContainerRef = useRef(null);

  // --- Helper: Reset state on new file upload or error ---
  const resetFileUploadStates = () => {
    setSelectedFile(null);
    setOriginalFileDetails(null);
    setSheets([]);
    setSelectedSheet("");
    setColumns([]);
    setXAxis("");
    setYAxis("");
    setZAxis("");
    setUploadedFileId(null);
    setIsFileSaved(false);
    resetChartStates();
  };

  const resetChartStates = () => {
    setRawChartData(null);
    setFormattedChartData(null);
    setChartConfig(null);
    setError(null); // Clear general error, specific errors handled by toast
  };

  // insights
  const [insights, setInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

  const idToken = localStorage.getItem("idToken");

  useEffect(() => {
    // Clear error after a delay
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // In Visualize.jsx

const handleGetInsights = async () => {
    if (!uploadedFileId || !selectedSheet) {
        toast.error("No data selected", { description: "Please upload a file and select a sheet to get insights." });
        return;
    }

    // --- BUILD THE CONTEXT PACKAGE ---
    const currentSheetData = sheets.find(s => s.name === selectedSheet);
    if (!currentSheetData) {
        toast.error("Sheet data not found.");
        return;
    }

    const contextPackage = {
        fileIdentifier: uploadedFileId, // The permanent or temp ID
        sheetName: selectedSheet,
        chartContext: formattedChartData ? { // Only include chart context if a chart has been generated
            type: chartType,
            xAxis: xAxis,
            yAxis: yAxis,
        } : null,
        dataSummary: {
            columns: currentSheetData.columns,
            // You might want to add column type detection here in the future
            // For now, sending column names is a great start.
            rowCount: currentSheetData.rowCount,
            // Gemini works best with raw arrays, not objects with keys
            previewRows: currentSheetData.data.slice(0, 10), // Send first 10 rows of raw data
        }
    };
    
    // --- API CALL LOGIC ---
    setIsGeneratingInsights(true);
    setInsights(null); // Clear old insights
    try {
        const response = await axios.post(`${BACKEND_URL}/excel/insights/generate`, contextPackage, {
            headers: { Authorization: `Bearer ${idToken}` }
        });
        if (response.data.success) {
            setInsights(response.data.insights);
            toast.success("Insights generated successfully!");
        } else {
            toast.error("Failed to get insights", { description: response.data.message });
        }
    } catch (err) {
        const message = err.response?.data?.message || err.message || "An unknown error occurred.";
        toast.error("Insight Generation Error", { description: message });
    } finally {
        setIsGeneratingInsights(false);
    }
};

  //load file history function
  const loadFileFromHistory = async (fileIdToLoad) => {
    if (!idToken) {
      toast.error("Authentication Error", {
        description: "Please log in to load files.",
      });
      setIsLoadingFileDetails(false);
      return;
    }
    if (!fileIdToLoad) return;

    console.log(
      `Attempting to load file from history with DB ID: ${fileIdToLoad}`
    );
    setIsLoadingFileDetails(true);
    setError(null);
    resetFileUploadStates();

    try {
      // Calls the backend GET /api/v1/excel/files/:dbFileId route
      const response = await axios.get(
        `${BACKEND_URL}/excel/files/${fileIdToLoad}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success && response.data.file) {
        const fileDetails = response.data.file;
        toast.success(`Loaded from history: ${fileDetails.originalname}`);

        // Set selectedFile to a mock object for display purposes in FileUploaderUI (if you want to show it)
        // Or, you might have a different UI element to show "Loaded: filename.xlsx"
        setSelectedFile({
          name: fileDetails.originalname,
          type: fileDetails.mimetype,
          size: fileDetails.size,
        });
        setOriginalFileDetails({
          originalname: fileDetails.originalname,
          mimetype: fileDetails.mimetype,
          size: fileDetails.size,
        });

        setUploadedFileId(fileDetails._id);
        setIsFileSaved(true); // This file is from the database, so it's considered "saved"

        const sheetsWithPreview = (fileDetails.sheets || []).map((sheet) => ({
          ...sheet, // name, columns, rowCount should be here
          previewData: (sheet.data || []).slice(0, 5).map((row) => {
            // sheet.data is the array of row arrays
            const rowObject = {};
            (sheet.columns || []).forEach((col, i) => {
              rowObject[col] = row[i] !== undefined ? row[i] : "";
            });
            return rowObject;
          }),
        }));
        setSheets(sheetsWithPreview);

        if (sheetsWithPreview.length > 0) {
          const defaultSheet = sheetsWithPreview[0];
          setSelectedSheet(defaultSheet.name || "");
          setColumns(defaultSheet.columns || []);
        }
        // Optional: clear the URL param after loading, so a refresh doesn't re-trigger load
        // navigate('/visualize', { replace: true }); // Be careful with this, might cause loop if not handled well
      } else {
        throw new Error(
          response.data.message || "Failed to load file details from history."
        );
      }
    } catch (err) {
      console.error("Error loading file from history:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Could not load selected file.";
      setError(message);
      toast.error("Load Error", { description: message });
      navigate("/visualize", { replace: true }); // Navigate to clean visualize page on error
    } finally {
      setIsLoadingFileDetails(false);
    }
  };

  useEffect(() => {
    if (dbFileId && idToken) {
      // Only load if dbFileId and idToken are present
      loadFileFromHistory(dbFileId);
    } else if (!dbFileId) {
      // Optional: If navigating to /visualize without an ID,
      // and something was previously loaded, you might want to reset.
      // This depends on desired UX. For now, it will persist the last state.
      // if (uploadedFileId && isFileSaved) resetFileUploadStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbFileId, idToken]);

  // --- File Handling ---
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetFileUploadStates(); // Reset everything for a new file
    setSelectedFile(file); // Show filename immediately
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await axios.post(
        `${BACKEND_URL}/excel/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`, // Or useUserAuth token if available
          },
        }
      );

      console.log(response.data);
      if (response.data.success) {
        toast.success("File uploaded and parsed successfully!");
        const {
          sheets: backendSheets,
          tempFileId,
          originalname,
          mimetype,
          size,
        } = response.data;

        const sheetsWithPreview = backendSheets.map((sheet) => ({
          ...sheet,
          previewData: (sheet.data || []).slice(0, 5).map((row) => {
            const rowObject = {};
            (sheet.columns || []).forEach((col, i) => {
              rowObject[col] = row[i] !== undefined ? row[i] : "";
            });
            return rowObject;
          }),
        }));

        setSheets(sheetsWithPreview);
        setUploadedFileId(tempFileId);
        setOriginalFileDetails({ originalname, mimetype, size });
        setIsFileSaved(false); // New file is not yet saved

        if (sheetsWithPreview.length > 0) {
          const defaultSheet = sheetsWithPreview[0];
          setSelectedSheet(defaultSheet.name || "");
          setColumns(defaultSheet.columns || []);
        }
      } else {
        const message =
          response.data.message || "Upload failed. Please try again.";
        setError(message);
        toast.error("Upload Failed", { description: message });
        resetFileUploadStates(); // Clear filename on failure
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to upload file.";
      setError(message);
      toast.error("Upload Failed", { description: message });
      resetFileUploadStates(); // Clear filename on error
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = ""; // Reset file input
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    const sheetData = sheets.find((s) => s.name === sheetName);
    setColumns(sheetData?.columns || []);
    setXAxis("");
    setYAxis("");
    setZAxis("");
    resetChartStates(); // Clear chart when sheet changes
  };

  // --- Chart Generation ---
  const generateChart = async () => {
    if (
      !uploadedFileId ||
      !selectedSheet ||
      !chartType ||
      !xAxis ||
      !yAxis ||
      (chartType === "3d" && !zAxis)
    ) {
      toast.error("Missing Information", {
        description: `Please select a sheet, chart type, X axis, Y axis${
          chartType === "3d" ? ", and Z axis" : ""
        }.`,
      });
      return;
    }
    resetChartStates();
    setIsGenerating(true);

    try {
      const payload = {
        fileIdentifier: uploadedFileId, // IMPORTANT: Send the temp fileId in the payload
        sheet: selectedSheet,
        chartType,
        xAxis,
        yAxis,
        title: `${chartType.toUpperCase()} Chart: ${xAxis} vs ${yAxis}${
          chartType === "3d" && zAxis ? ` vs ${zAxis}` : ""
        }`,
      };
      if (chartType === "3d") payload.zAxis = zAxis;

      const response = await axios.post(
        `${BACKEND_URL}/excel/generate-chart`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        }
      );

      if (response.data.success && response.data.chartData) {
        const backendChartData = response.data.chartData;
        setRawChartData(backendChartData);
        const formatted = formatDataForFrontend(backendChartData);
        if (formatted) {
          setFormattedChartData(formatted);
          setChartConfig(backendChartData.config);
          toast.success("Chart generated successfully!");
        } else {
          // Error handled by formatDataForFrontend via toast
          setError("Failed to format chart data from backend.");
        }
      } else {
        const message = response.data.message || "Chart generation failed.";
        setError(message);
        toast.error("Chart Generation Failed", { description: message });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Chart generation encountered an error.";
      setError(message);
      toast.error("Generation Failed", { description: message });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- File Saving (Persisting uploaded file to DB) ---
  const handleSaveFileToAccount = async () => {
    if (!uploadedFileId || !originalFileDetails) {
      toast.error("No file uploaded or file details are missing to save.");
      return;
    }
    if (isFileSaved) {
      toast.info("File already saved to your account.");
      return;
    }

    setIsSavingFile(true);
    try {
      const payload = {
        tempFileId: uploadedFileId, // The temporary UUID
        originalname: originalFileDetails.originalname,
        mimetype: originalFileDetails.mimetype,
        size: originalFileDetails.size,
      };
      const response = await axios.post(
        `${BACKEND_URL}/excel/save-file`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("File saved to your account successfully!");
        setIsFileSaved(true); // Mark as saved
        // Optionally, store response.data.fileId (the new MongoDB _id) if needed for further actions
      } else {
        toast.error("Failed to save file", {
          description: response.data.message || "Backend error.",
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Could not save file.";
      toast.error("Failed to save file", { description: message });
    } finally {
      setIsSavingFile(false);
    }
  };

  // --- Chart Downloading ---
  const handleDownloadChart = async () => {
    setIsDownloading(true);
    const success = await downloadChartAsPng(
      chartContainerRef,
      formattedChartData,
      chartType,
      chartConfig
    );
    // Toast messages are handled within downloadChartAsPng
    setIsDownloading(false);
  };



  const currentPreviewData = sheets.find(
    (s) => s.name === selectedSheet
  )?.previewData;

  if (isLoadingFileDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500 p-8">
        <FaSpinner className="text-5xl animate-spin text-green-600 mb-6" />
        <p className="text-xl">Loading file from history...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 md:p-10 space-y-8"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="text-center" variants={sectionVariants}>
        <h1 className="text-3xl font-bold mb-2">Upload & Visualize Data</h1>
        <p className="text-gray-500">
          Upload Excel/CSV files and generate charts.
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-alert"
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <FileUploaderUI
        selectedFile={selectedFile}
        isUploading={isUploading}
        dragActive={dragActive}
        inputRef={inputRef}
        handleFileChange={handleFileChange}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      />

      {uploadedFileId && (
        <>
          <ChartControlsUI
            sheets={sheets}
            selectedSheet={selectedSheet}
            handleSheetChange={handleSheetChange}
            chartType={chartType}
            setChartType={setChartType}
            xAxis={xAxis}
            setXAxis={setXAxis}
            yAxis={yAxis}
            setYAxis={setYAxis}
            zAxis={zAxis}
            setZAxis={setZAxis}
            columns={columns}
            isGenerating={isGenerating}
            isUploading={isUploading}
            generateChart={generateChart}
            canSaveFile={!!uploadedFileId && !isFileSaved} // Enable save if file uploaded and not yet saved
            isSavingFile={isSavingFile}
            handleSaveFile={handleSaveFileToAccount}
            originalFileName={originalFileDetails?.originalname}
          />
          <AnimatePresence>
            {currentPreviewData && selectedSheet && (
              <DataPreviewTableUI
                selectedSheetName={selectedSheet}
                columns={columns}
                previewData={currentPreviewData}
              />
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {formattedChartData && chartConfig && (
          <ChartDisplayUI
            chartContainerRef={chartContainerRef}
            chartType={chartType}
            xAxis={xAxis}
            yAxis={yAxis}
            zAxis={zAxis} // For re-animation key
            renderedChart={renderChartVisualization(
              chartType,
              formattedChartData,
              chartConfig
            )}
            isDownloading={isDownloading}
            handleDownload={handleDownloadChart}
          />
        )}
      </AnimatePresence>
      {uploadedFileId && (
        <motion.div
          className="mt-10 pt-8 border-t"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* The button to trigger the analysis */}
          <div className="text-center mb-8">
            <Button
              size="lg"
              onClick={handleGetInsights}
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "✨ Get Smart Insights"
              )}
            </Button>
          </div>

          {/* The component to display the results */}
          <SmartInsights insights={insights} isLoading={isGeneratingInsights} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Visualize;
