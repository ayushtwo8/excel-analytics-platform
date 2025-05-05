import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LuUpload } from "react-icons/lu";
import { BarChart2, PieChart, LineChart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Chart from 'chart.js/auto';
import { toast } from "sonner";

const Visualize = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [columns, setColumns] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [chartType, setChartType] = useState("");
  const [aggregation, setAggregation] = useState("sum");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [error, setError] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  
  const inputRef = useRef(null);
  const chartRef = useRef(null);
  const fileUploadAreaRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Clean up chart instance when component unmounts or when dependencies change
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  // Clean up chart when relevant chart inputs change
  useEffect(() => {
    if (chartInstance && (chartType || xAxis || yAxis)) {
      chartInstance.destroy();
      setChartInstance(null);
    }
  }, [chartType, xAxis, yAxis, zAxis]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setError(null);
      setSelectedFile(file);

      const formData = new FormData();
      formData.append("excelFile", file);

      const response = await axios.post(
        `${backendUrl}/api/v1/excel/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("File uploaded successfully", {
          description: "Your Excel file has been uploaded and parsed.",
        });
        
        setSheets(response.data.sheets);
        
        // Set default sheet and columns
        if (response.data.sheets.length > 0) {
          setSelectedSheet(response.data.sheets[0]?.name || "");
          setColumns(response.data.sheets[0]?.columns || []);
        }
        
        setUploadedFileId(response.data.fileId);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to upload file";
      setError(errorMessage);
      toast.error("Upload Failed", {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSheetChange = (sheet) => {
    setSelectedSheet(sheet);
    // Find the selected sheet and update columns
    const selectedSheetData = sheets.find((s) => s.name === sheet);
    if (selectedSheetData) {
      setColumns(selectedSheetData.columns || []);
      // Reset axis selections when sheet changes
      setXAxis("");
      setYAxis("");
      setZAxis("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleKeyDown = (e) => {
    // Trigger click when pressing Enter or Space on the upload area
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current.click();
    }
  };

  const generateChart = async () => {
    // Validate required fields
    if (!uploadedFileId || !selectedSheet || !chartType || !xAxis) {
      toast.error("Missing required fields", {
        description: "Please select a sheet, chart type, and X-axis at minimum."
      });
      return;
    }

    // Additional validation for chart types that require Y-axis
    if ((chartType !== "pie") && !yAxis) {
      toast.error("Y-axis required", {
        description: "Please select a Y-axis for this chart type."
      });
      return;
    }

    // Additional validation for 3D charts
    if (chartType === "3d" && !zAxis) {
      toast.error("Z-axis required", {
        description: "Please select a Z-axis for 3D charts."
      });
      return;
    }
  
    try {
      setIsGenerating(true);
      setError(null);
  
      // Clean up existing chart if any
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
      
      const chartConfig = {
        sheet: selectedSheet,
        chartType,
        xAxis,
        yAxis,
        aggregation,
        title: `${chartType.toUpperCase()} Chart of ${xAxis} vs ${yAxis}`,
      };
  
      // Add Z-axis for 3D charts
      if (chartType === "3d" && zAxis) {
        chartConfig.zAxis = zAxis;
      }
  
      const response = await axios.post(
        `${backendUrl}/api/v1/excel/files/${uploadedFileId}/charts`,
        chartConfig,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          },
        }
      );
  
      if (response.data.success) {
        renderChart(response.data.chartData);
        toast.success("Chart generated successfully!");
      }
    } catch (err) {
      let errorMessage;
      
      // Enhanced error reporting
      if (err.response) {
        // Check for specific MongoDB error
        if (err.response.data.message && err.response.data.message.includes("Cast to string failed")) {
          errorMessage = "Error saving chart: One or more fields have invalid values. Please check your selections.";
        } else {
          errorMessage = err.response.data.message || "Server error. Please try again.";
        }
      } else if (err.request) {
        errorMessage = "No response received from server. Please check your connection.";
      } else {
        errorMessage = "Error setting up request: " + err.message;
      }
      
      setError(errorMessage);
      toast.error("Chart Generation Failed", {
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderChart = (chartData) => {
    console.log("Chart data received:", chartData);
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext("2d");
    let newChartInstance;
    
    // Chart configuration options common to most chart types
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    };
    
    // Chart rendering based on type
    switch (chartType) {
      case "bar":
        newChartInstance = createBarChart(ctx, chartData, commonOptions);
        break;
      case "line":
        newChartInstance = createLineChart(ctx, chartData, commonOptions);
        break;
      case "pie":
        newChartInstance = createPieChart(ctx, chartData, commonOptions);
        break;
      case "scatter":
        newChartInstance = createScatterChart(ctx, chartData, commonOptions);
        break;
      case "3d":
        handle3DChart();
        return; // Early return as we're not creating a Chart.js instance
      default:
        return;
    }

    setChartInstance(newChartInstance);
  };

  // Individual chart creation functions
  const createBarChart = (ctx, chartData, commonOptions) => {
    return new Chart(ctx, {
      type: "bar",
      data: chartData.data,
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: `Bar Chart: ${xAxis} vs ${yAxis}`,
            font: { size: 16 }
          },
        },
      },
    });
  };

  const createLineChart = (ctx, chartData, commonOptions) => {
    return new Chart(ctx, {
      type: "line",
      data: chartData.data,
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: `Line Chart: ${xAxis} vs ${yAxis}`,
            font: { size: 16 }
          },
        },
      },
    });
  };

  const createPieChart = (ctx, chartData, commonOptions) => {
    return new Chart(ctx, {
      type: "pie",
      data: chartData.data,
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: `Pie Chart: ${xAxis} Distribution`,
            font: { size: 16 }
          },
          legend: {
            position: "right",
          },
        },
      },
    });
  };

  const createScatterChart = (ctx, chartData, commonOptions) => {
    return new Chart(ctx, {
      type: "scatter",
      data: chartData.data,
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: `Scatter Plot: ${xAxis} vs ${yAxis}`,
            font: { size: 16 }
          },
        },
      },
    });
  };

  const handle3DChart = () => {
    toast.info("3D Chart Visualization", {
      description: "3D charts require an additional library like Plotly.js which will be integrated in a future update.",
    });
  };

  // Get data preview for the selected sheet
  const getSheetPreview = () => {
    const selectedSheetData = sheets.find(s => s.name === selectedSheet);
    return selectedSheetData || { columns: [], data: [] };
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Upload & Visualize Data</h1>
        <p className="text-gray-500">Drag & drop Excel files, select fields, and generate beautiful charts.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <div
        ref={fileUploadAreaRef}
        className={cn(
          "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all",
          isUploading ? "bg-gray-50 border-gray-400" : 
          dragActive ? "border-green-400 bg-green-50" : 
          "border-gray-300 hover:border-green-300 hover:bg-green-50/30"
        )}
        onClick={() => !isUploading && inputRef.current.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload Excel file"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-2" />
            <p className="text-lg">Uploading and parsing file...</p>
          </>
        ) : (
          <>
            <LuUpload className="text-5xl text-green-600 mb-2" />
            <p className="text-lg">
              {selectedFile ? selectedFile.name : "Drop or click to upload .xls/.xlsx"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Maximum file size: 10MB
            </p>
          </>
        )}
        <Input
          type="file"
          accept=".xls,.xlsx,.csv"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
          aria-hidden="true"
        />
      </div>

      {/* Chart Controls */}
      {sheets.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Sheet Selection */}
            <Select value={selectedSheet} onValueChange={handleSheetChange}>
              <SelectTrigger aria-label="Select Sheet">
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

            {/* Chart Type */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger aria-label="Select Chart Type">
                <SelectValue placeholder="Select Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
                <SelectItem value="3d">3D Chart</SelectItem>
              </SelectContent>
            </Select>

            {/* X Axis */}
            <Select value={xAxis} onValueChange={setXAxis} disabled={!selectedSheet}>
              <SelectTrigger aria-label="Select X Axis">
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

            {/* Y Axis */}
            <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedSheet}>
              <SelectTrigger aria-label="Select Y Axis">
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

            {/* Z Axis (only for 3D charts) */}
            {chartType === "3d" && (
              <Select value={zAxis} onValueChange={setZAxis} disabled={!selectedSheet}>
                <SelectTrigger aria-label="Select Z Axis">
                  <SelectValue placeholder="Select Z Axis (for 3D)" />
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

            {/* Aggregation Method */}
            <Select value={aggregation} onValueChange={setAggregation}>
              <SelectTrigger aria-label="Select Aggregation Method">
                <SelectValue placeholder="Aggregation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateChart} 
            disabled={!chartType || !xAxis || (chartType !== "pie" && !yAxis) || (chartType === "3d" && !zAxis) || isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white"
            aria-label="Generate Chart"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart2 className="mr-2 h-4 w-4" />
                Generate Chart
              </>
            )}
          </Button>
        </div>
      )}

      {/* Chart Display */}
      <Card className="h-96 mt-6">
        <CardContent className="p-4 h-full flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center" aria-live="polite" role="status">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
              <p className="text-gray-500">Generating your chart...</p>
            </div>
          ) : chartInstance ? (
            <canvas ref={chartRef} className="w-full h-full" aria-label={`${chartType} chart of ${xAxis} vs ${yAxis}`} />
          ) : (
            <div className="text-center text-gray-400">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select your data fields and generate a chart</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      {sheets.length > 0 && selectedSheet && (
        <Card>
          <CardContent className="p-4 mt-4">
            <h3 className="font-semibold text-lg mb-4">Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" aria-label={`Data preview for ${selectedSheet}`}>
                <thead className="bg-gray-50">
                  <tr>
                    {getSheetPreview().columns.map((col, i) => (
                      <th 
                        key={i} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        scope="col"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSheetPreview().data?.slice(1, 6).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cell !== null && cell !== undefined ? cell : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Showing first 5 rows of data for preview
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Visualize;