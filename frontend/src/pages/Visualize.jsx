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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Loader2,
  Bookmark,
  Save,
  Upload,
  History,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion"; // Import motion

// --- Framer Motion Variants ---
const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1, duration: 0.4 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const uploaderContentVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const controlItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const alertVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.2 } },
};

const chartCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  }, // Smooth ease
};

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
  const [rawChartData, setRawChartData] = useState(null);
  const [formattedChartData, setFormattedChartData] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingChart, setIsSavingChart] = useState(false);

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

  // Example: Placeholder for handleSheetChange (replace with your full function)
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

  // Example: Placeholder for handleDrag (replace with your full function)
  const handleDrag = (e) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  // Example: Placeholder for formatDataForFrontend (replace with your full function)
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

  // Example: Placeholder for handleDownloadPng (replace with your full function)
  const handleDownloadPng = async () => {
    if (!chartContainerRef.current || !formattedChartData) {
      toast.error("Chart not ready");
      return;
    }

    setIsDownloading(true);
    const containerElement = chartContainerRef.current; // The CardContent element
    const filename = `chart-${chartType}-${chartConfig?.xAxis}-${chartConfig?.yAxis}.png`;

    try {
      if (chartType === "3d") {
        // --- Plotly Download (remains the same) ---
        const plotlyGraphDiv =
          containerElement.querySelector(".js-plotly-plot");
        if (plotlyGraphDiv) {
          await Plotly.downloadImage(plotlyGraphDiv, {
            /* options */
          });
          toast.success("Chart downloaded (Plotly).");
        } else {
          /* handle error */
        }
      } else {
        // --- Recharts Download (SVG to Canvas) ---
        const svgElement = containerElement.querySelector("svg"); // Find the SVG element

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
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
          // Create a canvas
          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");

          // Fill background (optional, SVG might be transparent)
          ctx.fillStyle = "white"; // Or get background from containerElement if needed
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // ctx.scale(scale, scale); // Apply scale if needed before drawing
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Get PNG Data URL
          const pngUrl = canvas.toDataURL("image/png");

          // Trigger download
          const link = document.createElement("a");
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
          toast.error("Download Failed", {
            description: "Could not process chart image.",
          });
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
      toast.error("Download Failed", {
        description: error.message || "Could not save chart as PNG.",
      });
      setIsDownloading(false); // Ensure loading stops on sync error
    }
    // Only set downloading false here if it wasn't an async Recharts case
    if (chartType === "3d") {
      setIsDownloading(false);
    }
  };

  const handleSaveChartToDb = async () => {
    if (!uploadedFileId || !chartConfig || !chartType || !selectedSheet) {
      toast.error("Cannot save chart", {
        description: "Missing chart configuration or file context.",
      });
      return;
    }

    setIsSavingChart(true);
    try {
      // --- Prepare Payload ---
      // Adjust this payload based on what your backend expects
      const payload = {
        fileId: uploadedFileId, // ID of the source Excel file
        sheetName: selectedSheet, // Name of the sheet used
        chartType: chartType, // Type of chart (bar, line, etc.)
        config: chartConfig, // The config object from the backend (contains axes, title)
        // Optional: You might want to save a snapshot of the data,
        // a name/title for the saved chart, or a timestamp (backend can handle this too)
        // E.g., savedChartName: chartConfig?.title || `Chart from ${selectedSheet}`
      };

      console.log("Saving chart with payload:", payload);

      // --- API Call ---
      const response = await axios.post(
        `${backendUrl}/excel/saveFile`, // <<< CHANGE TO YOUR ACTUAL SAVE ENDPOINT
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Chart saved to history successfully!");
        // Optionally: you could update some UI state if needed
      } else {
        toast.error("Failed to save chart", {
          description: response.data.message || "Backend error.",
        });
      }
    } catch (err) {
      console.error("Error saving chart:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Could not save chart to history.";
      toast.error("Failed to save chart", { description: message });
    } finally {
      setIsSavingChart(false);
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

  // Example: Placeholder for renderChart (replace with your full function)
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

  return (
    // Animate the main container
    <motion.div
      className="p-6 md:p-10 space-y-8"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animate Title Section */}
      <motion.div className="text-center" variants={sectionVariants}>
        <h1 className="text-3xl font-bold mb-2">Upload & Visualize Data</h1>
        <p className="text-gray-500">Upload Excel files and generate charts.</p>
      </motion.div>

      {/* Animate Alert */}
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

      {/* Animate Uploader */}
      <motion.div
        variants={sectionVariants} // Animate uploader block as a whole
        className={cn(
          "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 relative overflow-hidden", // Added relative/overflow
          isUploading
            ? "bg-gray-100 border-gray-400 cursor-not-allowed"
            : dragActive
            ? "border-green-500 bg-green-50 scale-[1.02]" // Added scale effect on drag
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        )}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        whileHover={!isUploading && !dragActive ? { scale: 1.01 } : {}} // Subtle hover scale
        transition={{ type: "spring", stiffness: 300, damping: 15 }} // Spring for scale effect
      >
        {/* Use AnimatePresence for smooth content switching */}
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              variants={uploaderContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center text-center"
            >
              <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-2" />
              <p>Uploading and parsing...</p>
              {selectedFile && (
                <p className="text-sm text-gray-500 mt-1">
                  ({selectedFile.name})
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="default-upload"
              variants={uploaderContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center text-center"
            >
              <LuUpload className="text-5xl text-green-600 mb-2" />
              <p className="px-4">
                {selectedFile
                  ? selectedFile.name
                  : "Drop or click to upload .xls/.xlsx"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Input
          type="file"
          accept=".xls,.xlsx,.csv"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </motion.div>

      {/* Animate Controls Section */}
      <AnimatePresence>
        {uploadedFileId && sheets.length > 0 && (
          <motion.div
            key="controls-section"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sectionVariants} // Animate the whole section
            className="space-y-6"
          >
            {/* Stagger individual controls */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }} // Stagger children
            >
              <motion.div variants={controlItemVariants}>
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
              </motion.div>
              <motion.div variants={controlItemVariants}>
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
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="pie">Pie</SelectItem>
                    <SelectItem value="scatter">Scatter</SelectItem>
                    <SelectItem value="3d">3D Scatter</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div variants={controlItemVariants}>
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
                      <SelectItem key={`x-${col}`} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div variants={controlItemVariants}>
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
                      <SelectItem key={`y-${col}`} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              {chartType === "3d" && (
                <motion.div variants={controlItemVariants}>
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
                        <SelectItem key={`z-${col}`} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </motion.div>

            {/* Animate Generate Button Wrapper */}
            <motion.div
              variants={controlItemVariants}
              className="flex flex-wrap items-center gap-3"
            >
              <motion.div // Wrapper for hover/tap
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
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
                  }
                  className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isGenerating ? (
                      <motion.span
                        key="generating"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex items-center"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Generating...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="generate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        {chartType === "3d" ? (
                          <Orbit className="mr-2 h-4 w-4" />
                        ) : (
                          <BarChart2 className="mr-2 h-4 w-4" />
                        )}{" "}
                        Generate Chart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
              <AnimatePresence>
                {formattedChartData &&
                  chartConfig && ( // Renders only when chart exists
                    <motion.div
                      key="save-button-action"
                      /* ... entry/exit animation ... */
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {/* This button now triggers the dialog */}
                          <Button
                            variant="outline"
                            className={cn(/* ... */)}
                            // onClick is handled by AlertDialogTrigger
                            disabled={
                              isSavingChart || isGenerating || isUploading
                            }
                            title="Save current chart configuration to your history"
                          >
                            {/* Display icon/text normally, don't show loader here */}
                            <Bookmark className="mr-2 h-4 w-4" /> Save Chart
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Save to History
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will save the current chart
                              configuration (type: {chartType}, sheet:{" "}
                              {selectedSheet}, X: {xAxis}, Y: {yAxis}
                              {chartType === "3d" ? `, Z: ${zAxis}` : ""}) to
                              your history for future reference. Are you sure
                              you want to proceed?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              disabled={isSavingChart} // Disable cancel if saving is in progress
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSaveChartToDb} // Call save function on confirm
                              disabled={isSavingChart} // Disable confirm if saving
                              className="bg-green-600 hover:bg-green-700" // Style confirm button
                            >
                              {isSavingChart ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Saving...
                                </>
                              ) : (
                                "Yes, Save Chart"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animate Preview Table Section */}
      <AnimatePresence>
        {selectedSheet &&
          sheets.find((s) => s.name === selectedSheet)?.previewData && (
            <motion.div
              key="preview-table"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sectionVariants}
              className="bg-gray-50 border rounded-lg p-4 overflow-auto max-h-64"
            >
              <h2 className="text-lg font-semibold mb-2">
                Preview of "{selectedSheet}" (First 5 rows)
              </h2>
              {columns.length > 0 ? (
                <table className="min-w-full text-sm text-left border-collapse">
                  {/* Table content remains the same */}
                  <thead>
                    <tr className="bg-gray-200">
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="border px-2 py-1 font-medium text-gray-700"
                        >
                          {" "}
                          {col}{" "}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheets
                      .find((s) => s.name === selectedSheet)
                      ?.previewData?.map((row, idx) => (
                        <tr key={idx} className="even:bg-white odd:bg-gray-50">
                          {columns.map((col) => (
                            <td
                              key={`${idx}-${col}`}
                              className="border px-2 py-1 text-gray-800"
                            >
                              {row[col] === null || row[col] === undefined
                                ? ""
                                : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">
                  No columns found for this sheet.
                </p>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Animate Chart Display Area */}
      <AnimatePresence>
        {formattedChartData && chartConfig && (
          <motion.div
            key="chart-display"
            initial="hidden"
            animate="visible"
            exit="hidden" // You might want exit animation if regenerating clears the chart first
            variants={chartCardVariants}
          >
            <Card className="h-96 md:h-[500px] mt-6 shadow-lg relative border overflow-hidden">
              {" "}
              {/* Added border */}
              {/* Animate Download Button Wrapper */}
              <motion.div
                className="absolute top-3 right-3 z-10" // Position the interactive wrapper slightly offset
                whileHover={{ scale: 1.15, y: -2, rotate: 3 }} // Scale up, lift, slight rotate on hover
                whileTap={{ scale: 0.9 }} // Scale down on tap
                transition={{ type: "spring", stiffness: 350, damping: 15 }} // Add a springy transition
              >
                <Button
                  variant="secondary" // Use secondary variant for a subtle background/border by default
                  size="icon"
                  className={cn(
                    // Use cn utility for conditional classes if needed later
                    "rounded-full shadow-md ", // Keep rounded and shadow
                    "bg-white/90 text-slate-600", // Start slightly transparent white, define text color
                    "border border-slate-200/80", // Add a subtle border
                    "hover:bg-white hover:text-slate-900 hover:shadow-lg", // Opaque white, darker text, larger shadow on hover
                    "focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2", // Enhanced focus ring
                    "transition-all duration-200 ease-in-out" // Smooth CSS transitions
                  )}
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  title="Download Chart as PNG"
                >
                  <AnimatePresence mode="wait">
                    {isDownloading ? (
                      <motion.div
                        key="loader"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="download"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LuDownload className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
              <CardContent
                ref={chartContainerRef}
                className="p-1 sm:p-4 h-full flex items-center justify-center overflow-hidden"
              >
                {/* Use AnimatePresence to fade chart content in/out on change */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={chartType + xAxis + yAxis + zAxis} // Key changes when chart config changes
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full" // Ensure div takes full space
                  >
                    {renderChart()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Visualize;
