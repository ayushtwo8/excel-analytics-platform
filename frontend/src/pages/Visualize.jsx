import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils"; // <--- ADD THIS LINE
import { BarChart2, Loader2 } from "lucide-react";
import { LuUpload, LuDownload } from "react-icons/lu";
import { Orbit } from "lucide-react";
import axios from "axios";
import { useUserAuth } from "@/context/userAuthContext";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Plot from "react-plotly.js";

const Visualize = () => {
  const { user } = useUserAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [columns, setColumns] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [error, setError] = useState(null);
  // Store the raw backend response
  const [rawChartData, setRawChartData] = useState(null);
  // Store the data formatted for recharts
  const [formattedChartData, setFormattedChartData] = useState(null);
  // Store the actual axis keys returned by the backend config
  const [chartConfig, setChartConfig] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Define colors for Pie Chart slices
  const PIE_COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#FF4560",
    "#AF19FF",
    "#FFC658",
  ];

  const inputRef = useRef(null);
  const chartContainerRef = useRef(null);
  const backendUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state when a new file is uploaded
    setSelectedFile(null);
    setSheets([]);
    setSelectedSheet("");
    setColumns([]);
    setXAxis("");
    setYAxis("");
    setZAxis("");
    setUploadedFileId(null);
    setRawChartData(null);
    setFormattedChartData(null);
    setChartConfig(null);
    setError(null);

    try {
      setIsUploading(true);
      setError(null);
      setSelectedFile(file); // Show filename while uploading

      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await axios.post(
        `${backendUrl}/excel/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        }
      );
      console.log("File upload response:", response.data);

      if (response.data.success) {
        toast.success("File uploaded successfully");
        const { sheets, fileId } = response.data;

        const sheetsWithPreview = sheets.map((sheet) => {
          // Ensure data exists and has content before slicing
          const previewSourceData = sheet.data || [];
          const previewData = previewSourceData
            .slice(0, 5) // Take first 5 rows for preview
            .map((row) => {
              // Create object using columns as keys
              const rowObject = {};
              (sheet.columns || []).forEach((col, i) => {
                rowObject[col] = row[i] !== undefined ? row[i] : ""; // Handle potential missing values
              });
              return rowObject;
            });
          return { ...sheet, previewData };
        });

        setSheets(sheetsWithPreview);
        // Set default selections
        const defaultSheet = sheetsWithPreview[0];
        if (defaultSheet) {
          setSelectedSheet(defaultSheet.name || "");
          setColumns(defaultSheet.columns || []);
        } else {
          setSelectedSheet("");
          setColumns([]);
        }
        setUploadedFileId(fileId);
      } else {
        // Handle unsuccessful API response even if status code is 2xx
        const message =
          response.data.message || "Upload failed with unknown error.";
        setError(message);
        toast.error("Upload Failed", { description: message });
        setSelectedFile(null); // Clear filename on failure
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to upload file";
      setError(message);
      toast.error("Upload Failed", { description: message });
      setSelectedFile(null); // Clear filename on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    const sheetData = sheets.find((s) => s.name === sheetName);
    setColumns(sheetData?.columns || []);
    // Reset axis selections and chart when sheet changes
    setXAxis("");
    setYAxis("");
    setZAxis("");
    setRawChartData(null);
    setFormattedChartData(null);
    setChartConfig(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  // Function to format data for recharts
  // Function to format data for recharts, handling different backend structures
  const formatDataForFrontend = (backendData) => {
    // Basic initial check
    if (!backendData || !backendData.config || !backendData.data) {
      console.error(
        "Invalid backend data structure: Missing root 'config' or 'data'",
        JSON.stringify(backendData, null, 2)
      );
      toast.error("Data Formatting Error", {
        description: "Received incomplete data structure from server.",
      });
      return null;
    }

    const chartType = backendData.chartType;
    const config = backendData.config;
    const data = backendData.data;
    const datasets = data?.datasets; // Use optional chaining

    // Check for essential config keys needed universally
    if (!config.xAxis || !config.yAxis) {
      console.error(
        "Invalid backend data structure: Missing xAxis or yAxis in config",
        JSON.stringify(config, null, 2)
      );
      toast.error("Data Formatting Error", {
        description: "Missing chart configuration (axis).",
      });
      return null;
    }

    const xKey = config.xAxis; // e.g., 'StudyHours' or 'Subject'
    const yKey = config.yAxis; // e.g., 'Score'

    if (chartType === "3d") {
      // Backend already returns data in Plotly format {x:[], y:[], z:[], type:'scatter3d', ...}
      // Validate essential parts for Plotly 3D scatter
      if (
        !data.x ||
        !data.y ||
        !data.z ||
        !Array.isArray(data.x) ||
        !Array.isArray(data.y) ||
        !Array.isArray(data.z)
      ) {
        console.error(
          "Invalid 3D data structure: Missing or invalid x, y, or z arrays.",
          JSON.stringify(data, null, 2)
        );
        toast.error("Data Formatting Error", {
          description: "Invalid 3D data received.",
        });
        return null;
      }
      if (!config.zAxis) {
        // zAxis key must be in config for labels later
        console.error(
          "Invalid 3D config: Missing zAxis.",
          JSON.stringify(config, null, 2)
        );
        toast.error("Data Formatting Error", {
          description: "Missing 3D axis configuration.",
        });
        return null;
      }
      // Data is already in correct format for Plotly, return it directly
      return data;
    }

    // --- Scatter Chart Specific Handling ---
    else if (chartType === "scatter") {
      // Scatter expects datasets[0].data to be an array of {x, y} objects
      if (
        !datasets ||
        datasets.length === 0 ||
        !datasets[0].data ||
        !Array.isArray(datasets[0].data)
      ) {
        console.error(
          "Invalid scatter data structure: Missing or invalid datasets[0].data array.",
          JSON.stringify(data, null, 2)
        );
        toast.error("Data Formatting Error", {
          description: "Invalid scatter data received from server.",
        });
        return null;
      }

      const scatterPoints = datasets[0].data;

      // Optional: Check if points actually have x and y (using the first point as a sample)
      if (
        scatterPoints.length > 0 &&
        (scatterPoints[0].x === undefined || scatterPoints[0].y === undefined)
      ) {
        console.error(
          "Invalid scatter data points: Objects in datasets[0].data are missing 'x' or 'y' keys.",
          JSON.stringify(scatterPoints[0], null, 2) // Log the problematic point structure
        );
        toast.error("Data Formatting Error", {
          description: "Scatter data points have incorrect structure.",
        });
        return null;
      }

      // Transform [{x, y}, ...] to [{[xKey]: x, [yKey]: y}, ...]
      try {
        return scatterPoints.map((point) => ({
          [xKey]: point.x, // Map backend 'x' to the configured xKey
          [yKey]: point.y, // Map backend 'y' to the configured yKey
        }));
      } catch (e) {
        console.error(
          "Error processing scatter data points:",
          e,
          JSON.stringify(scatterPoints, null, 2)
        );
        toast.error("Data Formatting Error", {
          description: "Could not process scatter data points.",
        });
        return null;
      }
    }
    // --- Handling for other charts (Bar, Line, Pie) that expect labels + simple data array ---
    else {
      // These types expect a top-level 'labels' array and a simple 'data' array in datasets[0]
      if (
        !data.labels ||
        !Array.isArray(data.labels) ||
        !datasets ||
        datasets.length === 0 ||
        !datasets[0].data ||
        !Array.isArray(datasets[0].data)
      ) {
        console.error(
          `Invalid data structure for ${chartType}: Missing or invalid 'labels' or 'datasets[0].data' array.`,
          JSON.stringify(data, null, 2)
        );
        toast.error("Data Formatting Error", {
          description: `Invalid data received for ${chartType} chart.`,
        });
        return null;
      }

      const labels = data.labels;
      const values = datasets[0].data; // This should be a simple array like [10, 20, 30]

      // Check if the value array contains objects - it shouldn't for bar/line/pie
      if (
        values.length > 0 &&
        typeof values[0] === "object" &&
        values[0] !== null
      ) {
        console.error(
          `Invalid data structure for ${chartType}: datasets[0].data contains objects, expected simple values.`,
          JSON.stringify(values[0], null, 2)
        );
        toast.error("Data Formatting Error", {
          description: `Received complex data for simple ${chartType} chart.`,
        });
        return null;
      }

      // Check for length mismatch
      if (labels.length !== values.length) {
        console.error(
          `Mismatched lengths for ${chartType}: Labels (${labels.length}), Values (${values.length})`
        );
        toast.error("Data Mismatch", {
          description: "Labels and values count don't match.",
        });
        return null;
      }

      // Transform labels + values arrays to [{[xKey]: label, [yKey]: value}, ...]
      try {
        return labels.map((label, index) => ({
          [xKey]: label,
          [yKey]: values[index],
        }));
      } catch (e) {
        console.error(
          `Error processing ${chartType} data points:`,
          e,
          JSON.stringify(labels, null, 2),
          JSON.stringify(values, null, 2)
        );
        toast.error("Data Formatting Error", {
          description: `Could not process ${chartType} data points.`,
        });
        return null;
      }
    }
  };

  const handleDownloadPng = async () => {
        if (!chartContainerRef.current || !formattedChartData) {
            toast.error("Chart not ready"); return;
        }

        setIsDownloading(true);
        const containerElement = chartContainerRef.current; // The CardContent element
        const filename = `chart-${chartType}-${chartConfig?.xAxis}-${chartConfig?.yAxis}.png`;

        try {
            if (chartType === '3d') {
                // --- Plotly Download (remains the same) ---
                const plotlyGraphDiv = containerElement.querySelector('.js-plotly-plot');
                if (plotlyGraphDiv) {
                    await Plotly.downloadImage(plotlyGraphDiv, { /* options */ });
                    toast.success("Chart downloaded (Plotly).");
                } else { /* handle error */ }

            } else {
                // --- Recharts Download (SVG to Canvas) ---
                const svgElement = containerElement.querySelector('svg'); // Find the SVG element

                if (!svgElement) {
                    throw new Error("Could not find the SVG chart element to capture.");
                }

                // Get SVG dimensions for canvas scaling
                const svgRect = svgElement.getBoundingClientRect();
                const scale = 2; // Optional: Increase for higher resolution
                const canvasWidth = svgRect.width * scale;
                const canvasHeight = svgRect.height * scale;

                // Serialize SVG to XML string
                const serializer = new XMLSerializer();
                let svgString = serializer.serializeToString(svgElement);

                // Create an Image object from the SVG via Data URL
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                const image = new Image();
                image.onload = () => {
                    // Create a canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    const ctx = canvas.getContext('2d');

                    // Fill background (optional, SVG might be transparent)
                    ctx.fillStyle = 'white'; // Or get background from containerElement if needed
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // ctx.scale(scale, scale); // Apply scale if needed before drawing
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    // Get PNG Data URL
                    const pngUrl = canvas.toDataURL('image/png');

                    // Trigger download
                    const link = document.createElement('a');
                    link.href = pngUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    URL.revokeObjectURL(url); // Clean up blob URL
                    toast.success("Chart downloaded (Recharts).");
                    setIsDownloading(false); // Move here inside onload
                };

                image.onerror = (err) => {
                    console.error("Failed to load SVG into Image:", err);
                    toast.error("Download Failed", { description: "Could not process chart image." });
                    URL.revokeObjectURL(url); // Clean up blob URL
                    setIsDownloading(false);
                };

                image.src = url; // Start loading the image

                // Important: Since image loading is async, don't set isDownloading=false here
                // return; // Exit here, the rest happens in image.onload
                 // setIsDownloading is now handled within onload/onerror

            } // End of Recharts case
        } catch (error) {
            console.error("Chart download failed:", error);
            toast.error("Download Failed", { description: error.message || "Could not save chart as PNG." });
            setIsDownloading(false); // Ensure loading stops on sync error
        }
        // Only set downloading false here if it wasn't an async Recharts case
        if (chartType === '3d') {
           setIsDownloading(false);
        }
    };

  const generateChart = async () => {
    console.log("Generating chart...");
    if (
      !uploadedFileId ||
      !selectedSheet ||
      !chartType ||
      !xAxis ||
      !yAxis ||
      (chartType === "3d" && !zAxis)
    ) {
      toast.error("Missing Information", {
        description: `Please select a sheet, chart type, X axis, and Y axis ${
          chartType === "3d" ? ", and Z axis" : ""
        }.`,
      });
      return;
    }

    // Reset previous chart data
    setRawChartData(null);
    setFormattedChartData(null);
    setChartConfig(null);
    setError(null);

    try {
      setIsGenerating(true);
      const payload = {
        sheet: selectedSheet,
        chartType,
        xAxis,
        yAxis,
        title: `${chartType.toUpperCase()} Chart: ${xAxis} vs ${yAxis}`, // Base title
      };
      // Add zAxis ONLY if chartType is '3d'
      if (chartType === "3d") {
        payload.zAxis = zAxis;
        payload.title += ` vs ${zAxis}`; // Add zAxis to title
      }

      const response = await axios.post(
        `${backendUrl}/excel/files/${uploadedFileId}/charts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        }
      );

      console.log("Chart generation response:", response.data);

      if (response.data.success && response.data.chartData) {
        const backendChartData = response.data.chartData;
        setRawChartData(backendChartData); // Store raw response if needed

        // --- Data Transformation ---
        const formattedData = formatDataForFrontend(backendChartData);
        // --- End Transformation ---

        if (formattedData) {
          setFormattedChartData(formattedData);
          setChartConfig(backendChartData.config); // Store config for axis keys
          toast.success("Chart generated successfully");
        } else {
          setError("Failed to format data received from backend.");
          toast.error("Chart Generation Failed", {
            description:
              "Could not process the data received from the backend.",
          });
        }
      } else {
        const message = response.data.message || "Chart generation failed.";
        setError(message);
        toast.error("Chart Generation Failed", { description: message });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Chart generation failed";
      setError(message);
      toast.error("Generation Failed", {
        description: message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render Chart Component ---
  // Decide which chart component to render based on chartType
  // For now, only BarChart is fully implemented based on the request
  const renderChart = () => {
    if (!formattedChartData || !chartConfig) {
      console.log("renderChart returning null: Data or config missing.");
      return null; // Correct: return null if data isn't ready
    }

    const xDataKey = chartConfig.xAxis; // Use key from backend config
    const yDataKey = chartConfig.yAxis; // Use key from backend config
    const zDataKey = chartConfig.zAxis;

    // TODO: Add logic for other chart types (Line, Pie, Scatter)
    // if (chartType === 'line') { ... }
    // if (chartType === 'pie') { ... }
    switch (chartType) {
      case "3d":
        return (
          <Plot
            // Plotly expects data as an ARRAY of trace objects.
            // formattedChartData is already the trace object from the backend.
            data={[formattedChartData]}
            layout={{
              title:
                chartConfig.title ||
                `${xDataKey} vs ${yDataKey} vs ${zDataKey}`, // Use title from config if available
              margin: { l: 0, r: 0, b: 0, t: 50 }, // Adjust margins for title
              scene: {
                // Configure 3D scene axes using keys from config
                xaxis: { title: xDataKey },
                yaxis: { title: yDataKey },
                zaxis: { title: zDataKey },
              },
              autosize: true, // Enable autosize
            }}
            style={{ width: "100%", height: "100%" }} // Ensure Plotly fills container
            useResizeHandler={true} // Let Plotly handle resizing
            config={{ responsive: true }} // Ensure responsiveness config
          />
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* Assuming xDataKey represents categories */}
              <XAxis dataKey={xDataKey} />
              {/* Assuming yDataKey represents numbers */}
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone" // Or "linear", "step", etc.
                dataKey={yDataKey}
                stroke="#8884d8" // Line color
                activeDot={{ r: 8 }} // Highlight dot on hover
                strokeWidth={2} // Thicker line
              />
              {/* Add more <Line> components here if your backend */}
              {/* ever supports multiple datasets/Y-axes */}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedChartData}
                cx="50%" // Center X
                cy="50%" // Center Y
                labelLine={false} // Don't draw lines from slice to label
                // Example label function: display name + percentage
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  index,
                  name,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  // Only render label if percentage is large enough to avoid clutter
                  return percent > 0.03 ? (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize="12"
                    >
                      {`${formattedChartData[index][xDataKey]} (${(
                        percent * 100
                      ).toFixed(0)}%)`}
                    </text>
                  ) : null;
                }}
                outerRadius="80%" // Pie size relative to container
                fill="#8884d8" // Default fill (overridden by Cell)
                dataKey={yDataKey} // The numeric value key
                nameKey={xDataKey} // The label/name key
              >
                {/* Assign colors to each slice */}
                {formattedChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                // Custom tooltip formatter if needed
                formatter={(value, name, props) => [`${value}`, `${name}`]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              {/* Specify type="category" for XAxis if labels are strings */}
              {/* Specify type="number" if XAxis data are numbers */}
              <XAxis type="category" dataKey={xDataKey} name={xDataKey} />
              {/* Y-axis should generally be numeric for scatter */}
              <YAxis type="number" dataKey={yDataKey} name={yDataKey} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter
                name={`${yDataKey} vs ${xDataKey}`} // Legend entry name
                data={formattedChartData}
                fill="#8884d8" // Dot color
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "bar": // Fall through to default or handle explicitly
      default: // Default to Bar Chart
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xDataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yDataKey} fill="#8884d8" />
              {/* Add more <Bar> components here if backend supports multiple datasets */}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };
  // --- End Render Chart Component ---

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Upload & Visualize Data</h1>
        <p className="text-gray-500">Upload Excel files and generate charts.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div
        className={cn(
          "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200", // Added transition
          isUploading
            ? "bg-gray-100 border-gray-400 cursor-not-allowed" // Indicate loading state better
            : dragActive
            ? "border-green-500 bg-green-50" // Enhanced drag active state
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50" // Added hover state
        )}
        onClick={() => !isUploading && inputRef.current?.click()} // Added optional chaining
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-2" />
            <p>Uploading and parsing...</p>
          </>
        ) : (
          <>
            <LuUpload className="text-5xl text-green-600 mb-2" />
            <p>
              {selectedFile
                ? selectedFile.name
                : "Drop or click to upload .xls/.xlsx"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>{" "}
            {/* Example: Add size info */}
          </>
        )}
        <Input
          type="file"
          accept=".xls,.xlsx,.csv" // Keep CSV if supported by backend
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Show controls only after successful upload */}
      {uploadedFileId && sheets.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            {" "}
            {/* Adjusted grid for 4 selects */}
            <Select
              value={selectedSheet}
              onValueChange={handleSheetChange}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sheet" />
              </SelectTrigger>
              <SelectContent>
                {sheets.map((sheet) => (
                  <SelectItem key={sheet.name} value={sheet.name}>
                    {sheet.name} ({sheet.rowCount} rows)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={chartType}
              onValueChange={(value) => {
                setChartType(value);
                if (value !== "3d") setZAxis("");
              }}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                {/* Ensure these are NOT disabled */}
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
                <SelectItem value="scatter">Scatter</SelectItem>
                <SelectItem value="3d">3D Scatter</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={xAxis}
              onValueChange={setXAxis}
              disabled={!selectedSheet || isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select X Axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={yAxis}
              onValueChange={setYAxis}
              disabled={!selectedSheet || isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Y Axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {chartType === "3d" && (
              <Select
                value={zAxis}
                onValueChange={setZAxis}
                disabled={!selectedSheet || isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Z Axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            onClick={generateChart}
            disabled={
              !selectedSheet ||
              !chartType ||
              !xAxis ||
              !yAxis ||
              (chartType === "3d" && !zAxis) ||
              isGenerating ||
              isUploading
            } // Add isUploading check
            className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto" // Make button full width on mobile
          >
            {isGenerating ? (
              <Loader2 />
            ) : chartType === "3d" ? (
              <Orbit className="mr-2 h-4 w-4" />
            ) : (
              <BarChart2 className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate Chart"}
          </Button>
        </div>
      )}

      {/* previewData - Show only if a sheet is selected */}
      {selectedSheet &&
        sheets.find((s) => s.name === selectedSheet)?.previewData && (
          <div className="bg-gray-50 border rounded-lg p-4 overflow-auto max-h-64">
            <h2 className="text-lg font-semibold mb-2">
              Preview of "{selectedSheet}" (First 5 rows)
            </h2>
            {columns.length > 0 ? (
              <table className="min-w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="border px-2 py-1 font-medium text-gray-700"
                      >
                        {" "}
                        {/* Styling header */}
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheets
                    .find((s) => s.name === selectedSheet)
                    ?.previewData?.map((row, idx) => (
                      // --- THIS is line 451 or around it ---
                      <tr key={idx} className="even:bg-white odd:bg-gray-50">
                        {/* POTENTIAL WHITESPACE ISSUE HERE */}
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="border px-2 py-1 text-gray-800"
                          >
                            {row[col] === null || row[col] === undefined
                              ? ""
                              : String(row[col])}
                          </td>
                        ))}
                        {/* OR POTENTIAL WHITESPACE ISSUE HERE */}
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No columns found for this sheet.</p>
            )}
          </div>
        )}
      {/* Chart Display Area - Use formatted data and dynamic keys */}
      {formattedChartData && chartConfig && (
        <Card className="h-96 md:h-[500px] mt-6 shadow-md relative ">
          {/* Download Button (Positioned inside the card) */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white" // Position top-right
            onClick={handleDownloadPng}
            disabled={isDownloading}
            title="Download Chart as PNG"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LuDownload className="h-4 w-4" />
            )}
          </Button>

          <CardContent
            ref={chartContainerRef} // <-- CORRECT: ref is a prop of CardContent
            className="p-1 sm:p-4 h-full flex items-center justify-center overflow-hidden"
          >
            {/* This will now render the correct chart based on chartType */}
            {renderChart()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Visualize;
