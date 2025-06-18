// src/features/visualize/components/ChartControlsUI.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BarChart2, Loader2, Bookmark, Orbit } from "lucide-react";
import { sectionVariants, controlItemVariants } from "../utils/motionVariants";

const ChartControlsUI = ({
  sheets,
  selectedSheet,
  handleSheetChange,
  chartType,
  setChartType,
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
  zAxis,
  setZAxis,
  columns,
  isGenerating,
  isUploading,
  generateChart,
  canSaveFile, // New prop: boolean to enable/disable "Save File" button
  isSavingFile, // Renamed from isSavingChart
  handleSaveFile, // Renamed from handleSaveUploadedFile
  originalFileName, // For AlertDialog display
}) => {
  const showControls = sheets && sheets.length > 0;

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          key="controls-section"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={sectionVariants}
          className="space-y-6"
        >
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={controlItemVariants}>
              <Select value={selectedSheet} onValueChange={handleSheetChange} disabled={isGenerating || isUploading}>
                <SelectTrigger><SelectValue placeholder="Select Sheet" /></SelectTrigger>
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
                  if (value !== "3d") setZAxis(""); // Reset Z-axis if not 3D
                }}
                disabled={isGenerating || isUploading}
              >
                <SelectTrigger><SelectValue placeholder="Select Chart Type" /></SelectTrigger>
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
              <Select value={xAxis} onValueChange={setXAxis} disabled={!selectedSheet || isGenerating || isUploading}>
                <SelectTrigger><SelectValue placeholder="Select X Axis" /></SelectTrigger>
                <SelectContent>
                  {columns.map((col) => <SelectItem key={`x-${col}`} value={col}>{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </motion.div>
            <motion.div variants={controlItemVariants}>
              <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedSheet || isGenerating || isUploading}>
                <SelectTrigger><SelectValue placeholder="Select Y Axis" /></SelectTrigger>
                <SelectContent>
                  {columns.map((col) => <SelectItem key={`y-${col}`} value={col}>{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </motion.div>
            {chartType === "3d" && (
              <motion.div variants={controlItemVariants}>
                <Select value={zAxis} onValueChange={setZAxis} disabled={!selectedSheet || isGenerating || isUploading}>
                  <SelectTrigger><SelectValue placeholder="Select Z Axis" /></SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => <SelectItem key={`z-${col}`} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={controlItemVariants} className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              <Button
                onClick={generateChart}
                disabled={!selectedSheet || !chartType || !xAxis || !yAxis || (chartType === "3d" && !zAxis) || isGenerating || isUploading}
                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isGenerating ? (
                    <motion.span key="generating" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </motion.span>
                  ) : (
                    <motion.span key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                      {chartType === "3d" ? <Orbit className="mr-2 h-4 w-4" /> : <BarChart2 className="mr-2 h-4 w-4" />} Generate Chart
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            
            {/* "Save File" Button and Dialog */}
            <AnimatePresence>
              {canSaveFile && ( // Show only if a file is uploaded and not yet saved (logic managed in Visualize.jsx)
                <motion.div
                  key="save-file-button-action"
                  variants={controlItemVariants} // Re-use or define new variant
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isSavingFile || isGenerating || isUploading}
                        title="Save the uploaded file to your account"
                      >
                        <Bookmark className="mr-2 h-4 w-4" /> Save File
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Save File</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will save the uploaded file "{originalFileName || 'current file'}" to your account.
                          Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSavingFile}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSaveFile}
                          disabled={isSavingFile}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSavingFile ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                          ) : (
                            "Yes, Save File"
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
  );
};

export default ChartControlsUI;