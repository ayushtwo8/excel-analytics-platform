import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaRobot, FaLightbulb, FaChartLine, FaExclamationTriangle } from "react-icons/fa";

// This is a new helper component for individual insight cards
const InsightCard = ({ icon, title, children, className }) => (
  <Card className={`hover:shadow-lg transition-shadow duration-200 ease-in-out ${className}`}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-700 space-y-2">
      {children}
    </CardContent>
  </Card>
);

const SmartInsights = ({ insights, isLoading }) => {
  // Skeleton Loader UI to show while fetching data
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* --- Heading --- */}
      <div className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-gray-800">
        <FaRobot className="text-green-600" />
        <h1>Smart Insights</h1>
      </div>

      {/* --- Main Content Area --- */}
      {isLoading ? (
        renderSkeletons()
      ) : insights ? (
        <div className="space-y-6">
          {/* 1. Overall Summary */}
          <Alert>
            <FaLightbulb className="h-4 w-4" />
            <AlertTitle className="font-semibold">Overall Summary</AlertTitle>
            <AlertDescription>
              {insights.summary}
            </AlertDescription>
          </Alert>
          
          {/* 2. Key Statistics Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Key Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {insights.keyStats?.map((stat, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-medium text-gray-800">{stat}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 3. Detailed Insight Cards (Trends, Anomalies, Recommendations) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightCard icon={<FaChartLine className="text-blue-500" />} title="Trends">
              <ul className="list-disc pl-5">
                {insights.trends?.map((trend, index) => (
                  <li key={index} className="mb-2">{trend}</li>
                ))}
              </ul>
            </InsightCard>

            <InsightCard icon={<FaLightbulb className="text-yellow-500" />} title="Recommendations">
              <ul className="list-disc pl-5">
                {insights.recommendations?.map((rec, index) => (
                  <li key={index} className="mb-2">{rec}</li>
                ))}
              </ul>
            </InsightCard>

            {insights.anomalies?.length > 0 && (
              <div className="lg:col-span-2">
                <InsightCard
                  icon={<FaExclamationTriangle className="text-red-500" />}
                  title="Anomalies & Warnings"
                  className="border-red-200"
                >
                  <ul className="list-disc pl-5">
                    {insights.anomalies.map((anomaly, index) => (
                      <li key={index} className="mb-2">{anomaly}</li>
                    ))}
                  </ul>
                </InsightCard>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Initial state when no insights have been generated yet
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <FaRobot className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">Unlock AI-Powered Insights</h3>
          <p className="text-gray-500 text-sm mt-2">
            After uploading and selecting your data, click the "Get Smart Insights" button to analyze your file.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;