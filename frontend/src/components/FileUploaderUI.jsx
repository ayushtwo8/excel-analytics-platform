// src/features/visualize/components/FileUploaderUI.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input"; // Assuming this path is correct
import { Loader2 } from "lucide-react";
import { LuUpload } from "react-icons/lu";
import { cn } from "@/lib/utils"; // Assuming this path is correct
import { uploaderContentVariants, sectionVariants } from "../utils/motionVariants";

const FileUploaderUI = ({
  selectedFile,
  isUploading,
  dragActive,
  inputRef,
  handleFileChange,
  handleDrag,
  handleDrop,
  onClick,
}) => {
  return (
    <motion.div
      variants={sectionVariants}
      className={cn(
        "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 relative overflow-hidden",
        isUploading
          ? "bg-gray-100 border-gray-400 cursor-not-allowed"
          : dragActive
          ? "border-green-500 bg-green-50 scale-[1.02]"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      )}
      onClick={onClick}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag} // Simplified: setDragActive(false) will be handled in main component
      onDrop={handleDrop}
      whileHover={!isUploading && !dragActive ? { scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
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
                : "Drop or click to upload .xls/.xlsx/.csv"}
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
  );
};

export default FileUploaderUI;