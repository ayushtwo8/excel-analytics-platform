// src/features/visualize/components/DataPreviewTableUI.jsx
import React from "react";
import { motion } from "framer-motion";
import { sectionVariants } from "../utils/motionVariants";

const DataPreviewTableUI = ({ selectedSheetName, columns, previewData }) => {
  if (!selectedSheetName || !previewData || previewData.length === 0) {
    return null;
  }

  return (
    <motion.div
      key={`preview-${selectedSheetName}`} // Ensure re-animation if sheet changes
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      className="bg-gray-50 border rounded-lg p-4 overflow-auto max-h-64"
    >
      <h2 className="text-lg font-semibold mb-2">
        Preview of "{selectedSheetName}" (First 5 rows)
      </h2>
      {columns && columns.length > 0 ? (
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              {columns.map((col) => (
                <th
                  key={col}
                  className="border px-2 py-1 font-medium text-gray-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) => (
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
          No columns found or data available for preview in this sheet.
        </p>
      )}
    </motion.div>
  );
};

export default DataPreviewTableUI;