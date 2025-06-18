// src/features/visualize/utils/chartHelpers.js
import React from "react";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Plot from "react-plotly.js";
import Plotly from 'plotly.js-dist-min'; // For Plotly.downloadImage

export const PIE_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#8884D8", "#FF4560", "#AF19FF", "#FFC658",
];  

export const formatDataForFrontend = (backendData) => {
  if (!backendData || !backendData.config || !backendData.data) {
    console.error("Invalid backend data structure: Missing root 'config' or 'data'", JSON.stringify(backendData, null, 2));
    toast.error("Data Formatting Error", { description: "Received incomplete data structure from server." });
    return null;
  }
  const chartType = backendData.config.chartType;
  const config = backendData.config;
  const data = backendData.data;
  const datasets = data?.datasets;

  if (!config.xAxis || !config.yAxis) {
    console.error("Invalid backend data structure: Missing xAxis or yAxis in config", JSON.stringify(config, null, 2));
    toast.error("Data Formatting Error", { description: "Missing chart configuration (axis)." });
    return null;
  }
  const xKey = config.xAxis;
  const yKey = config.yAxis;

  if (chartType === "3d") {
    if (!data.x || !data.y || !data.z || !Array.isArray(data.x) || !Array.isArray(data.y) || !Array.isArray(data.z)) {
      console.error("Invalid 3D data structure: Missing or invalid x, y, or z arrays.", JSON.stringify(data, null, 2));
      toast.error("Data Formatting Error", { description: "Invalid 3D data received." });
      return null;
    }
    if (!config.zAxis) {
      console.error("Invalid 3D config: Missing zAxis.", JSON.stringify(config, null, 2));
      toast.error("Data Formatting Error", { description: "Missing 3D axis configuration." });
      return null;
    }
    return data; // Plotly 3D data is usually directly usable
  } else if (chartType === "scatter") {
    if (!datasets || datasets.length === 0 || !datasets[0].data || !Array.isArray(datasets[0].data)) {
      console.error("Invalid scatter data structure", JSON.stringify(data, null, 2));
      toast.error("Data Formatting Error", { description: "Invalid scatter data." });
      return scatterPoints.map(point => ({ [xKey]: point.x, [yKey]: point.y }));
    }
    const scatterPoints = datasets[0].data;
    if (scatterPoints.length > 0 && (scatterPoints[0].x === undefined || scatterPoints[0].y === undefined)) {
      console.error("Invalid scatter data points: Missing 'x' or 'y' keys.", JSON.stringify(scatterPoints[0], null, 2));
      toast.error("Data Formatting Error", { description: "Scatter data points incorrect." });
      return null;
    }
    try {
      return scatterPoints.map(point => ({ [xKey]: point.x, [yKey]: point.y }));
    } catch (e) {
      console.error("Error processing scatter data points:", e, JSON.stringify(scatterPoints, null, 2));
      toast.error("Data Formatting Error", { description: "Could not process scatter data." });
      return null;
    }
  } else { // Bar, Line, Pie
    if (!data.labels || !Array.isArray(data.labels) || !datasets || datasets.length === 0 || !datasets[0].data || !Array.isArray(datasets[0].data)) {
      console.error(`Invalid data structure for ${chartType}`, JSON.stringify(data, null, 2));
      toast.error("Data Formatting Error", { description: `Invalid data for ${chartType}.` });
      return null;
    }
    const labels = data.labels;
    const values = datasets[0].data;
    if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
        console.error(`Invalid data values for ${chartType}: expected simple values.`, JSON.stringify(values[0], null, 2));
        toast.error("Data Formatting Error", { description: `Received complex data for ${chartType}.`});
        return null;
    }
    if (labels.length !== values.length) {
      console.error(`Mismatched lengths for ${chartType}: Labels (${labels.length}), Values (${values.length})`);
      toast.error("Data Mismatch", { description: "Labels and values count don't match." });
      return null;
    }
    try {
      return labels.map((label, index) => ({ [xKey]: label, [yKey]: values[index] }));
    } catch (e) {
      console.error(`Error processing ${chartType} data:`, e, JSON.stringify(labels, null, 2), JSON.stringify(values, null, 2));
      toast.error("Data Formatting Error", { description: `Could not process ${chartType} data.` });
      return null;
    }
  }
};

export const renderChartVisualization = (chartType, formattedChartData, chartConfig) => {
  if (!formattedChartData || !chartConfig) return null;

  const xDataKey = chartConfig.xAxis;
  const yDataKey = chartConfig.yAxis;
  const zDataKey = chartConfig.zAxis;

  switch (chartType) {
    case "3d":
      return (
        <Plot
          data={[formattedChartData]} // formattedChartData is the trace object for 3D
          layout={{
            title: chartConfig.title || `${xDataKey} vs ${yDataKey} vs ${zDataKey}`,
            margin: { l: 0, r: 0, b: 0, t: 50 },
            scene: {
              xaxis: { title: xDataKey, },
              yaxis: { title: yDataKey, },
              zaxis: { title: zDataKey, },

            },
            autosize: true,
          }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
          config={{ responsive: true }}
        />
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yDataKey} stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "pie":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedChartData}
              cx="50%" cy="50%"
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return percent > 0.03 ? (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="12">
                    {`${formattedChartData[index][xDataKey]} (${(percent * 100).toFixed(0)}%)`}
                  </text>
                ) : null;
              }}
              outerRadius="80%" fill="#8884d8"
              dataKey={yDataKey} nameKey={xDataKey}
            >
              {formattedChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    case "scatter":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="category" dataKey={xDataKey} name={xDataKey} />
            <YAxis type="number" dataKey={yDataKey} name={yDataKey} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name={`${yDataKey} vs ${xDataKey}`} data={formattedChartData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    case "bar":
    default:
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yDataKey} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
  }
};

export const downloadChartAsPng = async (chartContainerRef, formattedChartData, chartType, chartConfig) => {
  if (!chartContainerRef.current || !formattedChartData) {
    toast.error("Chart not ready to download.");
    return false;
  }
  const containerElement = chartContainerRef.current;
  const filename = `chart-${chartType}-${chartConfig?.xAxis || 'data'}-${chartConfig?.yAxis || 'values'}.png`;

  try {
    if (chartType === "3d") {
      const plotlyGraphDiv = containerElement.querySelector(".js-plotly-plot");
      if (plotlyGraphDiv) {
        await Plotly.downloadImage(plotlyGraphDiv, { filename, format: 'png', width: plotlyGraphDiv.offsetWidth, height: plotlyGraphDiv.offsetHeight });
        toast.success("3D Chart downloaded.");
        return true;
      } else {
        throw new Error("Plotly graph element not found.");
      }
    } else { // Recharts (SVG)
      const svgElement = containerElement.querySelector("svg");
      if (!svgElement) throw new Error("SVG chart element not found.");

      const svgRect = svgElement.getBoundingClientRect();
      const scale = 2; // For better resolution
      const canvasWidth = svgRect.width * scale;
      const canvasHeight = svgRect.height * scale;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");

          ctx.fillStyle = "white"; // Background color for the PNG
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // ctx.scale(scale, scale); // Apply scale before drawing if you want elements to scale up
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // Draw image scaled to canvas

          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
          toast.success("Chart downloaded.");
          resolve(true);
        };
        image.onerror = (err) => {
          URL.revokeObjectURL(url);
          console.error("Failed to load SVG into Image:", err);
          toast.error("Download Failed", { description: "Could not process chart image." });
          reject(err);
        };
        image.src = url;
      });
    }
  } catch (error) {
    console.error("Chart download failed:", error);
    toast.error("Download Failed", { description: error.message || "Could not save chart as PNG." });
    return false;
  }
};