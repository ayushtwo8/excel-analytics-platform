import react from "react"
import { Input } from "@/components/ui/input";

const Visualize = () => {

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData);
      setRawData(res.data.data);
      setChartData(null); // reset chart if new file is uploaded
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

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
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default Visualize;