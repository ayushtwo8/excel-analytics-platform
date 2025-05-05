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
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

  // Clear chart instance when component unmounts
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setSelectedSheet(response.data.sheets[0]?.name || "");
        setColumns(response.data.sheets[0]?.columns || []);
        setUploadedFileId(response.data.fileId);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.response?.data?.message || "Failed to upload file");
      toast.error("Upload Failed", {
        description: err.response?.data?.message || "Failed to upload file",
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
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const generateChart = async () => {
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    if (!uploadedFileId || !selectedSheet || !chartType || !xAxis || !yAxis) {
      toast.error("Missing Information", {
        description: "Please select all required fields to generate a chart.",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

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
          },
        }
      );

      if (response.data.success) {
        renderChart(response.data.chartData);
        toast.success("Chart Generated", {
          description: "Your chart has been generated successfully.",
        });
      }
    } catch (err) {
      console.error("Error generating chart:", err);
      setError(err.response?.data?.message || "Failed to generate chart");
      toast.error("Chart Generation Failed", {
        description: err.response?.data?.message || "Failed to generate chart",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderChart = (chartData) => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext("2d");
    
    // Create chart based on chart type
    let newChartInstance;
    
    switch (chartType) {
      case "bar":
        newChartInstance = new Chart(ctx, {
          type: "bar",
          data: chartData.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Bar Chart: ${xAxis} vs ${yAxis}`,
                font: { size: 16 }
              },
              legend: {
                position: "top",
              },
            },
          },
        });
        break;
      case "line":
        newChartInstance = new Chart(ctx, {
          type: "line",
          data: chartData.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Line Chart: ${xAxis} vs ${yAxis}`,
                font: { size: 16 }
              },
              legend: {
                position: "top",
              },
            },
          },
        });
        break;
      case "pie":
        newChartInstance = new Chart(ctx, {
          type: "pie",
          data: chartData.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
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
        break;
      case "scatter":
        newChartInstance = new Chart(ctx, {
          type: "scatter",
          data: chartData.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Scatter Plot: ${xAxis} vs ${yAxis}`,
                font: { size: 16 }
              },
              legend: {
                position: "top",
              },
            },
          },
        });
        break;
      // For 3D charts, you would need to use a library like Plotly.js
      case "3d":
        // Here we'd normally use Plotly.js, but for now just show a message
        toast.info("3D Chart", {
          description: "3D charts require Plotly.js integration, which is not included in this example.",
        });
        break;
      default:
        break;
    }

    setChartInstance(newChartInstance);
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
        className={cn(
          "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer",
          isUploading ? "bg-gray-50 border-gray-400" : dragActive ? "border-green-400 bg-green-50" : "border-gray-300"
        )}
        onClick={() => !isUploading && inputRef.current.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
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
        />
      </div>

      {/* Chart Controls */}
      {sheets.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Sheet Selection */}
            <Select value={selectedSheet} onValueChange={handleSheetChange}>
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

            {/* Chart Type */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
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

            {/* Y Axis */}
            <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedSheet}>
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

            {/* Z Axis (only for 3D charts) */}
            {chartType === "3d" && (
              <Select value={zAxis} onValueChange={setZAxis} disabled={!selectedSheet}>
                <SelectTrigger>
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
              <SelectTrigger>
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
            disabled={!chartType || !xAxis || !yAxis || (chartType === "3d" && !zAxis) || isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white"
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
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
              <p className="text-gray-500">Generating your chart...</p>
            </div>
          ) : chartType && xAxis && yAxis ? (
            <canvas ref={chartRef} className="w-full h-full" />
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {sheets.find(s => s.name === selectedSheet)?.columns.map((col, i) => (
                      <th 
                        key={i} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheets.find(s => s.name === selectedSheet)?.data?.slice(1, 6).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cell}
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