import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FaRobot } from "react-icons/fa";

const SmartInsights = () => {
  return (
    <div className="p-8 space-y-6">
      {/* Heading */}
      <div className="flex items-center gap-2 text-3xl font-bold text-gray-800">
        <FaRobot className="text-green-600" />
        Smart Insights
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-gray-500 text-sm text-center mt-6">
        AI-powered insights will be shown here after analyzing your uploaded Excel files.
      </div>
    </div>
  );
};

export default SmartInsights;
