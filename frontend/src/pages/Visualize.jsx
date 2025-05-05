import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { LuUpload } from "react-icons/lu";
import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Visualize = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [columns, setColumns] = useState([]); // will store parsed columns
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("");
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // 👇 Placeholder columns (Replace with parsed headers from Excel)
    setColumns(["Date", "Sales", "Revenue", "Users"]);
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

  return (
    <div className="p-10 space-y-10">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Upload & Visualize Data</h1>
        <p className="text-gray-500">Drag & drop Excel files, select fields, and generate beautiful charts.</p>
      </div>

      {/* Upload Section */}
      <div
        className={cn(
          "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer",
          dragActive ? "border-green-400 bg-green-50" : "border-gray-300"
        )}
        onClick={() => inputRef.current.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <LuUpload className="text-5xl text-green-600 mb-2" />
        <p className="text-lg">
          {selectedFile ? selectedFile.name : "Drop or click to upload .xls/.xlsx"}
        </p>
        <Input
          type="file"
          accept=".xls,.xlsx"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Chart Controls */}
      {columns.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setXAxis}>
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

            <Select onValueChange={setYAxis}>
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
          </div>

          <Button disabled={!chartType || !xAxis || !yAxis}>Render Chart</Button>
        </div>
      )}

      {/* Chart Placeholder */}
      {chartType && xAxis && yAxis && (
        <Card className="h-96 mt-6 flex items-center justify-center text-gray-400 border-dashed border-2">
          <p>Your chart will appear here.</p>
        </Card>
      )}
    </div>
  );
};

export default Visualize;
