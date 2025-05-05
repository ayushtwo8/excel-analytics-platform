import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaFileExcel } from "react-icons/fa";
import { MdOutlineHistory } from "react-icons/md";

const mockHistory = [
  {
    filename: "sales_data.xlsx",
    uploadedAt: "2025-05-01 10:23 AM",
  },
  {
    filename: "customer_info.xls",
    uploadedAt: "2025-04-28 02:45 PM",
  },
  {
    filename: "inventory_report.xlsx",
    uploadedAt: "2025-04-26 08:15 AM",
  },
];

const History = () => {
  return (
    <div className="p-8 space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-3xl font-bold text-gray-800">
          <MdOutlineHistory className="text-green-600" />
          Upload History
        </div>
        <Input
          placeholder="Search by filename..."
          className="w-72"
        />
      </div>

      {/* History List */}
      <ScrollArea className="h-[calc(100vh-200px)] pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockHistory.map((file, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FaFileExcel className="text-2xl text-green-600" />
                  <div>
                    <div className="font-medium text-gray-800">{file.filename}</div>
                    <div className="text-sm text-gray-500">{file.uploadedAt}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default History;
