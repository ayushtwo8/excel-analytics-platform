import react from "react"
import { Input } from "@/components/ui/input";

const Visualize = () => {
  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Upload & Visualize Data</h1>
        <p className="text-gray-500">Drag & drop Excel files, select fields, and generate beautiful charts.</p>
      </div>

      {/* Upload Section */}
      <div>
        <Input
          type="file"
          accept=".xls,.xlsx,.csv"
        />
      </div>
    </div>
  );
};

export default Visualize;