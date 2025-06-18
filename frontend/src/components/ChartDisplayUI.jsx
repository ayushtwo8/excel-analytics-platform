// src/features/visualize/components/ChartDisplayUI.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LuDownload } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { chartCardVariants } from "../utils/motionVariants";

const ChartDisplayUI = ({
  chartContainerRef,
  chartType, // For keying animation
  xAxis, yAxis, zAxis, // For keying animation
  renderedChart, // JSX of the chart itself
  isDownloading,
  handleDownload,
}) => {
  if (!renderedChart) {
    return null;
  }

  return (
    <motion.div
      key="chart-display-area"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={chartCardVariants}
    >
      <Card className="h-96 md:h-[500px] mt-6 shadow-lg relative border overflow-hidden">
        <motion.div
          className="absolute top-3 right-3 z-10"
          whileHover={{ scale: 1.15, y: -2, rotate: 3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
        >
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "rounded-full shadow-md bg-white/90 text-slate-600 border border-slate-200/80",
              "hover:bg-white hover:text-slate-900 hover:shadow-lg",
              "focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
              "transition-all duration-200 ease-in-out"
            )}
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download Chart as PNG"
          >
            <AnimatePresence mode="wait">
              {isDownloading ? (
                <motion.div key="loader" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </motion.div>
              ) : (
                <motion.div key="download" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
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
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chartType}-${xAxis}-${yAxis}-${zAxis}`} // Key changes to re-animate chart
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              {renderedChart}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChartDisplayUI;