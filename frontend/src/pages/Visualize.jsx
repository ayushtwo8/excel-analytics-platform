import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuUpload } from "react-icons/lu";
import { cn } from "@/lib/utils";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  return (
    <div
      className={cn(
        "h-full w-full p-10 transition-colors duration-300",
        dragActive ? "bg-green-50 border-2 border-dashed border-green-400" : "bg-white"
      )}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      {/* Heading */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Upload Excel File
        </h1>
        <p className="text-gray-500">
          Drag & drop your .xls or .xlsx file, or click anywhere to browse.
        </p>
      </div>

      {/* Dropzone Content */}
      <div className="flex flex-col items-center justify-center h-[calc(100%-6rem)] space-y-6 text-center">
        <LuUpload className="text-6xl text-green-600" />
        <h2 className="text-2xl font-semibold text-gray-800">
          {selectedFile ? "File Selected" : "Drop your Excel File here"}
        </h2>
        <p className="text-gray-500">
          {selectedFile ? selectedFile.name : "Supported formats: .xls, .xlsx"}
        </p>

        <Input
          type="file"
          accept=".xls,.xlsx"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          className="mt-4 flex items-center gap-2"
          disabled={!selectedFile}
        >
          <LuUpload className="text-lg" />
          Upload File
        </Button>
      </div>
    </div>
  );
};

export default Upload;
