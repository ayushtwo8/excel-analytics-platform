import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaFileExcel, FaSpinner } from "react-icons/fa"; // Added FaSpinner
import { MdOutlineHistory, MdErrorOutline } from "react-icons/md"; // Added MdErrorOutline
import { useUserAuth } from "@/context/userAuthContext"; // Assuming you use this for token/user
import { toast } from "sonner";
import { format } from 'date-fns'; // For date formatting

// Assuming your backend URL constant is available
const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

const History = () => {
  const { user } = useUserAuth(); // Get user and token
  const [historyFiles, setHistoryFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const idToken = localStorage.getItem("idToken");

  useEffect(() => {
    const fetchHistory = async () => {

      
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BACKEND_URL}/excel/files`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.data.success && Array.isArray(response.data.files)) {
          // Sort files by uploadedAt date, newest first
          const sortedFiles = response.data.files.sort(
            (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
          );
          setHistoryFiles(sortedFiles);
        } else {
          throw new Error(response.data.message || "Failed to fetch history: Unexpected response format.");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        const message = err.response?.data?.message || err.message || "Could not fetch upload history.";
        setError(message);
        toast.error("Fetch Error", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [idToken]); // Re-fetch if token changes (e.g., on login/logout)

  const filteredHistory = useMemo(() => {
    if (!searchTerm) {
      return historyFiles;
    }
    return historyFiles.filter((file) =>
      file.originalname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyFiles, searchTerm]);

  const handleViewFile = (dbFileId) => {
    // Placeholder for future functionality
    // e.g., navigate(`/visualize/${dbFileId}`) or open a modal
    if (!dbFileId) {
      toast.error("Error", { description: "File ID is missing, cannot view." });
      return;
    }
    console.log("View file:", dbFileId);
    navigate(`/dashboard/visualize/${dbFileId}`);
    
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy hh:mm a"); // Example: May 01, 2025 10:23 AM
    } catch (e) {
      console.warn("Could not format date:", dateString, e);
      return dateString; // Fallback to original string
    }
  };


  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-gray-800">
          <MdOutlineHistory className="text-green-600" />
          Upload History
        </div>
        <Input
          placeholder="Search by filename..."
          className="w-full sm:w-72"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* History List Area */}
      <ScrollArea className="h-[calc(100vh-200px)] pr-2 border rounded-md"> {/* Added border for better visual separation */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaSpinner className="text-4xl animate-spin text-green-600 mb-4" />
            <p>Loading history...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <MdErrorOutline className="text-5xl mb-4" />
            <p className="text-lg font-medium">Error Loading History</p>
            <p className="text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4"> {/* Or a specific refetch function */}
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <MdOutlineHistory className="text-5xl mb-4" />
            <p className="text-lg font-medium">No Uploads Found</p>
            <p className="text-sm">
              {searchTerm ? "No files match your search." : "You haven't uploaded any files yet."}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"> {/* Added padding inside ScrollArea */}
            {filteredHistory.map((file) => (
              <Card key={file._id || file.filename} className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <CardContent className="flex items-center justify-between p-4 space-x-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FaFileExcel className="text-3xl text-green-600 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-medium text-gray-800 truncate" title={file.originalname}>
                        {file.originalname}
                      </div>
                      
                       
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewFile(file._id)}>
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default History;