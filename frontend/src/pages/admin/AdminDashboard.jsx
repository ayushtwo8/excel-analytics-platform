import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUsers, FaFileAlt, FaUserPlus } from 'react-icons/fa';
import { toast } from 'sonner';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

const StatCard = ({ title, value, icon, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const idToken = localStorage.getItem("idToken");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch dashboard stats.';
        toast.error('Fetch Error', { description: message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [idToken]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Statistic Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<FaUsers className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Files Uploaded"
          value={stats?.totalFiles ?? 0}
          icon={<FaFileAlt className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="New Users (Last 7 Days)"
          value={stats?.newUsersLast7Days ?? 0}
          icon={<FaUserPlus className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <ul className="space-y-2">
                {stats?.recentUsers.map(user => (
                  <li key={user._id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <span>{user.email}</span>
                    <span className="text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* You can add a "Recent Files" card here similarly */}
      </div>
    </div>
  );
};

export default AdminDashboard;